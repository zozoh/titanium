////////////////////////////////////////////
const WnFbAlbum = {
  //----------------------------------------
  async reloadAllPhotosInCache({
    albumId,
    domain
  }={}) {
    // Reload from cache
    let fnm = `album.${albumId}.photos.json`
    let fph = `~/.domain/facebook/${domain}/${fnm}`
    let re = {
      fileName: fnm,
      filePath: fph
    }
    re.oCache = await Wn.Io.loadMeta(fph)
    if(re.oCache) {
      re.photos = await Wn.Io.loadContent(re.oCache, {as:"json"})
    }

    // Read the first page
    return re
  },
  //----------------------------------------
  async reloadAllPhotoList({
    albumId,
    domain,
    access_token,
    force= false
  }={}) {
    let fph;
    if(!force) {
      let {filePath, photos} = await WnFbAlbum.reloadAllPhotosInCache({
        albumId, domain
      })
      if(!_.isEmpty(photos)) {
        //console.log("In cache")
        return photos
      }
      fph = filePath
    }
    // Reload
    //console.log("reload force!!!")
    let photos = []

    // Reload first page
    let re = await Ti.Api.Facebook.getAlbumPhotoList({albumId, access_token})
    photos.push(...re.data)

    // Next pages...
    let after = _.get(re.paging, "cursors.after")
    while(after) {
      re = await Ti.Api.Facebook.getAlbumPhotoList({
        albumId,
        access_token,
        after
      })
      photos.push(...re.data)
      after = _.get(re.paging, "cursors.after")
    }

    // Save to cache
    if(!_.isEmpty(photos) && domain) {
      let input = JSON.stringify(photos)
      let cmdText = `str > ${fph}`
      await Wn.Sys.exec2(cmdText, {input})
    }

    // Done 
    return photos
  }
  //----------------------------------------
}
////////////////////////////////////////////
export default WnFbAlbum;