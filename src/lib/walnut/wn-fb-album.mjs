////////////////////////////////////////////
const WnFbAlbum = {
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