////////////////////////////////////////////
const WnYoutube = {
  //----------------------------------------
  async getVideoDetails(config, videoIds = []) {
    // Guard
    if (!config || _.isEmpty(videoIds)) {
      return
    }
    let { domain, thumbType, coverType } = config

    // Get api url
    let json = JSON.stringify({
      id: videoIds.join(","),
      part: config.videoPart
    })
    let cmdText = `xapi req youtube ${domain} videos -url -vars '${json}'`
    let curl = await Wn.Sys.exec2(cmdText, { as: "text" });
    if (!curl) {
      throw "Fail to get youtube API(videos) URL: " + cmdText
    }
    //console.log(curl)
    // Reload from youtube server
    let reo = await Ti.Http.get(curl, { as: "json" })

    if (!reo || !_.isArray(reo.items)) {
      throw "Fail to load youtube playlists by: " + cmdText
    }

    // Update uploadPlaylistId for reload all videos in channel
    let list = []
    _.forEach(reo.items, it => {
      let { id, snippet, contentDetails } = it
      let video = {
        id,
        title: snippet.title,
        publishedAt: snippet.publishedAt,
        description: snippet.description,
        thumbUrl: _.get(snippet, `thumbnails.${thumbType}.url`),
        coverUrl: _.get(snippet, `thumbnails.${coverType}.url`),
        defaultLanguage: snippet.defaultLanguage,
        defaultAudioLanguage: snippet.defaultAudioLanguage,
        categoryId: snippet.categoryId,
        duration: contentDetails.duration,
        definition: contentDetails.definition
      }

      let du = Ti.DateTime.parseTime(video.duration)
      video.du_in_sec = du.value
      video.du_in_str = du.toString("min")

      list.push(video)
    })
    // Done
    return list
  },
  //----------------------------------------
  async getAllVideos(config, playlistId) {
    // Guard
    if (!config) {
      return
    }
    // load key fields in config
    let reo = await WnYoutube.getPlaylistVideos(config, playlistId)
    let list = reo.list || []
    while (reo.next) {
      reo = await WnYoutube.getPlaylistVideos(config, playlistId, {
        pageToken: reo.next
      })
      list = _.concat(list, reo.list)
    }

    // Done
    return list
  },
  //----------------------------------------
  async getPlaylistVideos(config, playlistId, {
    pageToken, maxResults = 50
  } = {}) {
    // Guard
    if (!config) {
      return
    }
    // load key fields in config
    let { domain } = config

    // Default to get uploaed videos
    playlistId = playlistId || config.uploadsPlaylistId

    // Reload from youtube
    let json = JSON.stringify({
      playlistId, part: "contentDetails", pageToken, maxResults
    })

    // Get api url
    let cmdText = `xapi req youtube ${domain} playlistItems -url -vars '${json}'`
    let curl = await Wn.Sys.exec2(cmdText, { as: "text" });
    if (!curl) {
      throw "Fail to get youtube API(playlistItems) URL: " + cmdText
    }
    //console.log(curl)
    // Reload from youtube server
    let reo = await Ti.Http.get(curl, { as: "json" })

    if (!reo || !_.isArray(reo.items)) {
      throw "Fail to load youtube playlistItems by: " + cmdText
    }

    // Update uploadPlaylistId for reload all videos in channel
    let ids = []
    _.forEach(reo.items, it => {
      let vid = _.get(it.contentDetails, "videoId")
      ids.push(vid)
    })

    // Load video details
    let list = await WnYoutube.getVideoDetails(config, ids)

    // Return
    return {
      list,
      prev: reo.prevPageToken,
      next: reo.nextPageToken
    }
  },
  //----------------------------------------
  async getAllPlaylists(config, { force = false } = {}) {
    // Guard
    if (!config) {
      return
    }
    // load key fields in config
    let { domain } = config
    let ytHome = `~/.domain/youtube/${domain}`
    let list = [];
    // Load cache file
    let noexists = true
    if (!force) {
      let oFile = await Wn.Io.loadMeta(`${ytHome}/playlists.json`)
      if (oFile) {
        list = await Wn.Io.loadContent(oFile, { as: "json" })
        noexists = false
      }
    }

    // force reload
    if (noexists || force) {
      let reo = await WnYoutube.getPlaylists(config)
      list = reo.list || []
      while (reo.next) {
        reo = await WnYoutube.getPlaylists(config, { pageToken: reo.next })
        list = _.concat(list, reo.list)
      }

      // Save config
      let json = JSON.stringify(list)
      await Wn.Sys.exec2(`json -qn > ${ytHome}/playlists.json`, { input: json })
    }

    // Done
    return list
  },
  //----------------------------------------
  async getPlaylists(config, {
    pageToken, maxResults = 50
  } = {}) {
    // Guard
    if (!config) {
      return
    }
    // load key fields in config
    let { domain, channelId, thumbType } = config
    let ytHome = `~/.domain/youtube/${domain}`

    // Reload from youtube
    let json = JSON.stringify({
      channelId, part: config.playlistPart, pageToken, maxResults
    })

    // Get api url
    let cmdText = `xapi req youtube ${domain} playlists -url -vars '${json}'`
    let curl = await Wn.Sys.exec2(cmdText, { as: "text" });
    if (!curl) {
      throw "Fail to get youtube API(playlist) URL: " + cmdText
    }
    //console.log(curl)
    // Reload from youtube server
    let reo = await Ti.Http.get(curl, { as: "json" })

    if (!reo || !_.isArray(reo.items)) {
      throw "Fail to load youtube playlists by: " + cmdText
    }
    // cache result
    json = JSON.stringify(reo)
    let suffix = pageToken ? `_${pageToken}.json` : ".json"
    await Wn.Sys.exec2(`json -qn > ${ytHome}/results/playlists${suffix}`, { input: json })

    // Update uploadPlaylistId for reload all videos in channel
    let list = []
    _.forEach(reo.items, it => {
      let { id, snippet, contentDetails } = it
      let pl = {
        id,
        title: snippet.title,
        description: snippet.description,
        thumbUrl: _.get(snippet, `thumbnails.${thumbType}.url`),
        itemCount: contentDetails.itemCount
      }
      list.push(pl)
    })

    // Return
    return {
      list,
      prev: reo.prevPageToken,
      next: reo.nextPageToken
    }
  },
  //----------------------------------------
  /**
   * Reload youtube channel configuration
   * 
   * @param domain: domain Name
   * @param channelId
   * @param force
   * @returns Youtube channel configuration
   */
  async loadConfig({
    domain, channelId, force = false
  } = {}) {
    //console.log("loadConfig",domain)
    // Use default domain name 
    if (!domain) {
      domain = Wn.Session.getCurrentDomain()
    }
    // Load cache file
    let ytHome = `~/.domain/youtube/${domain}`
    let oConfig = await Wn.Io.loadMeta(`${ytHome}/youtube.json`)
    let noexists = true
    let config = {};
    if (oConfig) {
      config = await Wn.Io.loadContent(oConfig, { as: "json" })
      noexists = false
    }

    // Setup config default
    _.defaults(config, {
      domain,
      thumbType: "high",
      coverType: "maxres",
      maxResults: 50,
      channelId,
      channelTitle: "No Title",
      channelPart: "snippet,contentDetails,statistics",
      uploadsPlaylistId: null,
      playlistPart: "snippet,contentDetails,status,id,player,localizations",
      videoPart: "snippet,contentDetails,status,id,player"
    })

    // force reload
    if (noexists || force) {
      // Reload from youtube
      let json = JSON.stringify({
        id: channelId, part: config.channelPart
      })

      // Get api url
      let cmdText = `xapi req youtube ${domain} channels -url -vars '${json}'`
      let curl = await Wn.Sys.exec2(cmdText, { as: "text" });
      if (!curl) {
        throw "Fail to get youtube API(channels) URL: " + cmdText
      }
      //console.log(curl)
      // Reload from youtube server
      let reo = await Ti.Http.get(curl, { as: "json" })

      if (!reo || !_.isArray(reo.items) || _.isEmpty(reo.items)) {
        throw "Fail to load youtube channels by: " + cmdText
      }
      // cache result
      json = JSON.stringify(reo)
      await Wn.Sys.exec2(`json -qn > ${ytHome}/results/channels.json`, { input: json })

      // Update uploadPlaylistId for reload all videos in channel
      config.channelTitle = _.get(reo, "items.0.snippet.title")
      config.uploadsPlaylistId = _.get(reo,
        "items.0.contentDetails.relatedPlaylists.uploads")

      // Save config
      json = JSON.stringify(config)
      await Wn.Sys.exec2(`json -qn > ${ytHome}/youtube.json`, { input: json })
    }

    // Done
    return config
  }
  //----------------------------------------
}
////////////////////////////////////////////
export default WnYoutube;