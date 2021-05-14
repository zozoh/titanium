////////////////////////////////////////////
const WnFbAlbum = {
  //----------------------------------------
  getAlbumPhotoCacheInfo({albumId,
    domain}) {
    let fnm = `album.${albumId}.photos.json`
    let fph = `~/.domain/facebook/${domain}/${fnm}`
    return {
      fileName: fnm,
      filePath: fph
    }
  },
  //----------------------------------------
  async reloadAllPhotosInCache({
    albumId,
    domain
  }={}) {
    // Reload from cache
    let re = WnFbAlbum.getAlbumPhotoCacheInfo({
      albumId,
      domain
    })
    let fnm = re.fileName
    let fph = re.filePath
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
    } else {
      let {filePath} = WnFbAlbum.getAlbumPhotoCacheInfo({
        albumId,
        domain
      })
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
      //console.log("save to cache", fph)
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