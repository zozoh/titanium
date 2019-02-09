// Ti required(Ti.Http)
//---------------------------------------
function URL(actionName) {
  return "/o/" + actionName
}
//---------------------------------------
function AJAX_RETURN(reo) {
  if(!reo.ok) {
    throw reo
  }
  return reo.data;
}
//---------------------------------------
export const WnIo = {
  /***
   * Get object meta by id
   */
  async loadMetaById(id) {
    return fetch("id:"+id)
  },
  /***
   * Get object meta by full path
   */
  async loadMeta(path) {
    let url = URL("fetch")
    let reo = await Ti.Http.get(url, {
      params:{
        str : path
      }, 
      as:"json"})
    return AJAX_RETURN(reo)
  },
  /***
   * Get obj children by meta
   */
  async loadAncestors(str) {
    let url = URL("ancestors")
    let reo = await Ti.Http.get(url, {
      params: {str}, 
      as:"json"})
    return AJAX_RETURN(reo)
  },
  /***
   * Get obj children by meta
   */
  async loadChildren(pid, {skip, limit, sort, mine, match={}}={}) {
    if(!pid)
      return null
    // parent ID
    match.pid = pid
    // find them
    return WnIo.find({skip, limit, sort, mine, match})
  },
  /***
   * Query object
   */
  async find({skip=0, limit=100, sort={}, mine=true, match={}}={}) {
    let url = URL("find")
    let reo = await Ti.Http.get(url, {
      params: _.assign({}, match, {
        _l  : limit, 
        _o  : skip,
        _me : mine,
        _s  : JSON.stringify(sort)
      }), 
      as:"json"})
    return AJAX_RETURN(reo)
  },
  /***
   * Get obj content by meta:
   * 
   * - `DIR`   : null
   * - `text`  : PureText
   * - `json`  : JSON Object
   * - `image` : SHA1 finger
   */
  async loadContent(meta) {
    if(!meta || 'DIR' == meta.race) {
      return null
    }
    let mime = meta.mime || 'application/octet-stream'
    // PureText
    if(_.startsWith(mime, "text/") || "application/json" == mime) {
      let url = URL("content")
      let text = await Ti.Http.get(url, {
        params: {
          str : "id:" + meta.id,
          d   : "raw"
        }, 
        as:"text"})
      // For JSON 
      if(mime.indexOf("json") >= 0) {
        return JSON.parse(text)
      }
      // Others just return pure text content
      return text
    }

    // Others just return the SHA1 finger
    return meta.sha1
  }
}