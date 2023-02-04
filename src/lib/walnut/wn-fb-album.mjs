////////////////////////////////////////////
const WnFbAlbum = {
  async reloadAllPhotoList({
    albumId,
    domain,
    force
  } = {}) {
    let photos = []

    // Reload first page
    let re = await WnFbAlbum.loadPhotos(domain, albumId, { force })
    if (re && !_.isEmpty(re.data)) {
      photos.push(...re.data)

      // Next pages...
      while (re && re.after) {
        re = await await WnFbAlbum.loadPhotos(domain, albumId, { force, after: re.after })
        if (re && !_.isEmpty(re.data)) {
          photos.push(...re.data)
        }
      }
    }

    // Done 
    return photos
  },
  //----------------------------------------
  async loadPhotos(domain, id, { after, force } = {}) {
    let vars = JSON.stringify({ id, after })
    let fmak = force ? '-force' : ''
    let cmdText = `xapi send fb-graph ${domain} photos ${fmak} -vars '${vars}'`
    return await Wn.Sys.exec2(cmdText, { as: "json" })
  },
  //----------------------------------------
  async loadAlbums(domain, id, { after, force } = {}) {
    let vars = JSON.stringify({ id, after })
    let fmak = force ? '-force' : ''
    let cmdText = `xapi send fb-graph ${domain} albums ${fmak} -vars '${vars}'`
    return await Wn.Sys.exec2(cmdText, { as: "json" })
  },
  //----------------------------------------
  async loadPhoto(domain, id, force) {
    let vars = JSON.stringify({ id })
    let fmak = force ? '-force' : ''
    let cmdText = `xapi send fb-graph ${domain} photo ${fmak} -vars '${vars}'`
    return await Wn.Sys.exec2(cmdText, { as: "json" })
  },
  //----------------------------------------
}
////////////////////////////////////////////
export default WnFbAlbum;