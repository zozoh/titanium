import {WnUtil} from "./wn-util.mjs"
//---------------------------------------
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
  async loadChildren(meta, {skip, limit, sort, mine, match={}}={}) {
    if(!meta)
      return null
    if('DIR' != meta.race)
      return []
    // parent ID
    match.pid = meta.id
    // find them
    let children = await WnIo.find({skip, limit, sort, mine, match})
    // Auto set children path if noexists
    if(meta.ph && children && _.isArray(children.list)) {
      for(let child of children.list) {
        if(!child.ph) {
          child.ph = Ti.Util.appendPath(meta.ph, child.nm)
        }
      }
    }
    return children
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
   */
  async loadContent(meta, {as="text"}={}) {
    if(!meta || 'DIR' == meta.race) {
      return null
    }
    let mime = meta.mime || 'application/octet-stream'
    // PureText
    if(WnUtil.isMimeText(mime)) {
      let url = URL("content")
      let content = await Ti.Http.get(url, {
        params: {
          str : "id:" + meta.id,
          d   : "raw"
        }, as})
      // Others just return pure text content
      return content
    }

    // Others just return the SHA1 finger
    return meta.sha1
  },
  /***
   * Save obj content
   */
  async saveContentAsText(meta, content) {
    if(!meta || 'DIR' == meta.race) {
      throw Ti.Err.make('e-wn-io-writeNoFile', meta.ph || meta.nm)
    }
    // Prepare params
    let params = {
      str : "id:"+meta.id,
      content
    }
    // do send
    let url = URL("/save/text")
    let reo = await Ti.Http.post(url, {params, as:"json"})

    if(!reo.ok) {
      throw Ti.Err.make(reo.errCode, reo.data, reo.msg)
    }

    return reo.data
  },
  /***
   * Upload file
   */
  async uploadFile(file, {
    target = "~",
    mode = "a",
    tmpl = "${major}(${nb})${suffix}",
    progress = _.identity
  }={}) {
    // do send
    let url = URL("/save/stream")
    let newMeta = await Ti.Http.post(url, {
      file, 
      progress,
      params : {
        str  : target,
        nm   : file.name,
        sz   : file.size,
        mime : file.type,
        m    : mode,
        tmpl
      },
      as:"json"
    })
    return newMeta
  }
}