export default {
  ///////////////////////////////////////////////////////
  data : ()=>({
    myCurrentId : undefined,
    currentPlayListId : undefined,
    ytConfig : undefined,
    ytPlaylists : undefined,
    ytVideos : undefined,

    currentVideoIds : []
  }),
  ///////////////////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "meta" : {
      type : Object
    },
    "domain": {
      type : String
    },
    "channelId" : {
      type : String
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "multi" : {
      type : Boolean,
      default : false
    },
    "notifyName" : {
      type : String
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //---------------------------------------------------
    hasCurrent() {
      return this.myCurrentId ? true : false
    },
    //---------------------------------------------------
    CurrentVideo() {
      return this.getVideoObj(this.myCurrentId)
    },
    //---------------------------------------------------
    TheSearch() {
      return {
        filter : {
          majorKey : "playlistId",
          majorValue : this.currentPlayListId,
          keyword : this.currentVideoIds.join(",")
        }
      }
    },
    //---------------------------------------------------
    GuiLayout(){
      return {
        type: "cols",
        border:true,
        blocks: [/*{
          icon  : "fab-youtube",
          title : "Playlists",
          name : "nav",
          size : "20%",
          body : "pcNav"
        }, */{
          type : "rows",
          size : "65%",
          blocks : [{
              name : "filter",
              size : 42,
              body : "pcFilter"
            }, {
              name : "list",
              body : "pcList"
            }]
        }, {
          name : "detail",
          body : "pcDetail"
        }]
      }
    },
    //---------------------------------------------------
    GuiSchema() {
      return {
        pcFilter : {
          comType : "wn-thing-filter",
          comConf : {
            placeholder : "Comma-separated Video ID(s)",
            value: this.TheSearch,
            filter : {
              major: {
                placeholder : "Choose Playlist",
                options : this.ytPlaylists,
                width : .4,
                iconBy : "thumbUrl",
                textBy : "title",
                valueBy : "id",
                dropDisplay: [
                  "<thumbUrl:fas-youtube>", "itemCount::as-tip", "title"
                ],
                dropWidth : 500
              }
            },
            // sorter: {
            //   options: [
            //     { "value": "nm", "text": "i18n:wn-key-nm" },
            //     { "value": "ct", "text": "i18n:wn-key-ct" }
            //   ]
            // }
          }
        },
        pcList: {
          comType: "TiWall",
          comConf: {
            data: this.WallItemList,
            idBy: "id",
            multi: this.multi,
            display: {
              key : "..",
              comType : "ti-obj-thumb",
              comConf : {
                "..." : "${=value}"
              }
            }
          }
        },
        pcDetail: {
          comType: "NetYoutubeDetail",
          comConf: {
            value: this.CurrentVideo
          }
        }
      }
    },
    //---------------------------------------------------
    WallItemList() {
      if(!this.ytVideos)
        return
      let list = _.map(this.ytVideos, video=>{
        return {
          id : video.id,
          title : video.title,
          preview : video.thumbUrl,
          badges : {
            "SE" : {
              type : "text",
              className : "bchc-badge as-label",
              value : video.du_in_str
            }
          }
        }
      })
      return list
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    // async OnNavSelect({currentId}) {
    //   this.currentPlayListId = currentId
    //   await this.reloadVideos()
    // },
    //---------------------------------------------------
    OnListSelect({currentId, checkedIds}) {
      this.myCurrentId = currentId
      
      if(this.notifyName) {
        let payload;
        // Multi
        if(this.multi) {
          payload = this.findVideoObjs(checkedIds) 
        }
        // Single
        else {
          payload = _.cloneDeep(this.CurrentVideo)
        }
        this.$notify(this.notifyName, payload)
      }
      return {stop:false, name:"select"}
    },
    //---------------------------------------------------
    async OnFilterChange(payload) {
      let {majorValue, keyword, match} = payload
      //console.log("OnFilterChange", payload)
      this.currentPlayListId = majorValue
      this.currentVideoIds = Ti.S.splitIgnoreBlank(keyword, /[, ;\r\n]/g)
      //console.log(this.currentVideoIds)
      await this.reloadVideos()
    },
    //---------------------------------------------------
    getVideoObj(videoId) {
      if(videoId && _.isArray(this.ytVideos)) {
        for(let video of this.ytVideos) {
          if(video.id == videoId) {
            return video
          }
        }
      }
    },
    //---------------------------------------------------
    findVideoObjs(videoIds) {
      // Build Map
      let idMap = {}
      if(_.isArray(videoIds)) {
        _.forEach(videoIds, id=>idMap[id] = true)
      } else if(_.isString(videoIds)) {
        idMap[videoIds] = true
      } else if(_.isPlainObject(videoIds)) {
        idMap = videoIds
      }
      // Find 
      return _.filter(this.ytVideos, v=>idMap[v.id]?true:false)
    },
    //---------------------------------------------------
    getPlaylistObj(playlistId, playlists=this.ytPlaylists) {
      if(!playlists || !_.isArray(playlists))
        return

      for(let pl of playlists) {
        if(playlistId == pl.id) {
          return pl
        }
      }
    },
    //---------------------------------------------------
    async reloadVideos(plId = this.currentPlayListId) {
      //console.log("reloadVideos")
      this.ytVideos = undefined
      let config = this.ytConfig
      let videos;
      // Reload by videoIds 
      if(!_.isEmpty(this.currentVideoIds)) {
        videos = await Wn.Youtube.getVideoDetails(config, this.currentVideoIds)
      }
      // Reload by playlist
      else {
        videos = await Wn.Youtube.getAllVideos(config, plId)
      }
      this.ytVideos = videos
    },
    //---------------------------------------------------
    async reload(force=false) {
      // Guard
      if(!this.domain || !this.channelId)
        return

      this.ytVideos = undefined

      // Reload config
      let config = await Wn.Youtube.loadConfig({
        domain : this.domain,
        channelId : this.channelId,
        force
      })

      let playlists = await Wn.Youtube.getAllPlaylists(config)
      let plId = this.currentPlayListId
      if(playlists.length > 0) {
        let pl = this.getPlaylistObj(plId, playlists)
        if(!pl) {
          pl = _.nth(playlists, 0)
        }
        plId = _.get(pl, "id")
      }
      let videos = await Wn.Youtube.getAllVideos(config, plId)

      // Reload playlist
      this.currentPlayListId = plId
      this.ytConfig = config
      this.ytPlaylists = playlists
      this.ytVideos = videos
    },
    //--------------------------------------------
    async openCurrentMeta() {
      let meta = this.CurrentVideo || this.meta

      if(!meta) {
        await Ti.Toast.Open("i18n:nil-obj")
        return
      }

      let fields = "auto"
      if(this.hasCurrent) {
        const V_FIELD = (name, title)=>{
          return {
            title, name,
            comType : "TiLabel"
          }
        }
        fields = [
          V_FIELD("id", "ID"),
          V_FIELD("title", "Title"),
          V_FIELD("description", "Description"),
          V_FIELD("publishedAt", "PublishedAt"),
          V_FIELD("tags", "Tags"),
          V_FIELD("duration", "Duration"),
          V_FIELD("du_in_sec", "Du in sec"),
          V_FIELD("du_in_str", "Du in str"),
          V_FIELD("definition", "Definition"),
          V_FIELD("categoryId", "CategoryId"),
        ]
      }

      await Wn.EditObjMeta(meta, {
        fields,
        textOk : null,
        autoSave : false
      })
    },
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch : {
    "domain" : "reload",
    "channelId" : "reload"
  },
  ///////////////////////////////////////////////////////
  mounted : async function() {
    await this.reload();
  }
  ///////////////////////////////////////////////////////
}