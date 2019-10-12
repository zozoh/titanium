import {WnUtil} from "./wn-util.mjs"
////////////////////////////////////////////
// Ti required(Ti.Http)
//-----------------------------------------
function URL(actionName) {
  return "/o/" + actionName
}
//-----------------------------------------
function AJAX_RETURN(reo, invalid) {
  if(!reo.ok) {
    if(_.isUndefined(invalid))
      throw reo
    return invalid
  }
  return reo.data;
}
////////////////////////////////////////////
export const WnIo = {
  /***
   * Get object meta by id
   */
  async loadMetaById(id) {
    return WnIo.loadMeta("id:"+id)
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
    return AJAX_RETURN(reo, null)
  },
  /***
   * Get object meta by refer meta
   */
  async loadMetaAt(refer, path) {
    // eval absolute path
    let aph = path;

    // Relative to refer (path is not absolute)
    if(refer && !(/^(~\/|\/|id:)/.test(path))) {
      aph = `id:${refer.pid}/${path}`
    }
    // Do load
    return await WnIo.loadMeta(aph)
  },
  /***
   * Get obj children by meta
   */
  async loadAncestors(str) {
    let url = URL("ancestors")
    let reo = await Ti.Http.get(url, {
      params: {str}, 
      as:"json"})
    return AJAX_RETURN(reo, [])
  },
  /***
   * Get obj children by meta
   */
  async loadChildren(meta, {skip, limit, sort={nm:1}, mine, match={}}={}) {
    if(!meta)
      return null
    if('DIR' != meta.race)
      return []
    //......................................
    // Load children when linked obj
    if(meta.mnt || meta.ln) {
      let url = URL("children")
      let reo = await Ti.Http.get(url, {
        params: {
          "str" :  `id:${meta.id}`,
          "pg"  : true
        }, 
        as:"json"})
      return AJAX_RETURN(reo)
    }
    //......................................
    // Just normal query
    // parent ID
    match.pid = meta.id

    // find them
    let reo = await WnIo.find({skip, limit, sort, mine, match})
    // Auto set reo path if noexists
    if(meta.ph && reo && _.isArray(reo.list)) {
      for(let child of reo.list) {
        if(!child.ph) {
          child.ph = Ti.Util.appendPath(meta.ph, child.nm)
        }
      }
    }
    return reo
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
    let reo = await Ti.Http.post(url, {
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
    return reo
  }
}
////////////////////////////////////////////
export default WnIo;