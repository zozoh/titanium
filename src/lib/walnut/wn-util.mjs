////////////////////////////////////////////
export const WnUtil = {
  isMimeText(mime) {
    return /^text\//.test(mime) 
           || "application/x-javascript" == mime
           || "application/json" == mime
  },
  isMimeJson(mime) {
    return "text/json" == mime
           || "application/json" == mime
  },
  // adapt for old versiton walnut icon attribute
  getIconName(iconHtml) {
    let m = /^<i +class=["'] *(fa|zmdi|im) +(fa|zmdi|im)-([^" ]+) *["']> *<\/i>$/
              .exec(iconHtml)
    if(m) {
      return m[3]
    }
    return iconHtml
  },
  /***
   * Gen preview object for a object
   */
  genPreviewObj(meta) {
    // Uploaded thumb preview
    if(meta.thumb) {
      return {
        type : "image",
        value : '/o/thumbnail/id:' + meta.id
      }
    }
    // Customized Icon
    if(meta.icon) {
      let icon = WnUtil.getIconName(meta.icon)
      return Ti.Icons.get(icon, {
        type  : "font",
        value : icon
      })
    }
    // Default
    return Ti.Icons.get(meta)
  },
  getIconObj(meta) {
    if(meta && meta.icon) {
      // customized icon object
      if(_.isPlainObject(meta.icon)) {
        return _.assign(Ti.Icons.get(), meta.icon)
      }
      // customized icon name
      return {
        type  : "font",
        value : WnUtil.getIconName(meta.icon)
      }
    }
    // return default
    return Ti.Icons.get(meta)
  },
  getObjIcon(meta, dft) {
    if(!meta)
      return dft
    return meta.icon || Ti.Icons.get(meta)
  },
  /***
   * Get icon or thumb for a WnObj
   */
  getObjThumbIcon({
    icon,
    thumb,
    mime,
    type,
    race, 
    candidateIcon,
    timestamp=0
  }={}, dftIcon) {
    // Thumb as image
    if(thumb) {
      let src = `/o/content?str=${thumb}`
      if(timestamp > 0) {
        src += `&_t=${timestamp}`
      }
      return {
        type : "image",
        value : src
      }
    }
    //.............................................
    // Icon
    if(icon) {
      return {
        type  : "font",
        value  : icon
      }
    }
    //.............................................
    // Force Default
    if(candidateIcon) {
      return candidateIcon
    }
    //.............................................
    // Auto get by type
    if(type || mime || race) {
      return Ti.Icons.get({type, mime, race})
    }
    // Default
    return dftIcon
  },
  getObjThumbIcon2(canIcon, meta) {
    return WnUtil.getObjThumbIcon(_.defaults({
      candidateIcon : canIcon
    }, meta))
  },
  /***
   * return the object readable name
   */
  getObjDisplayName(meta, keys=[]) {
    return Ti.Util.getFallback(meta, keys, "title", "nm")
  },
  /***
   * Get Object link as `String`
   * 
   * @param meta{String|Object} : Object meta or id as string
   * @param options.appName{String} : Walnut App Name, "wn.manager" as default
   * @param options.encoded{Boolean} : Encode the path or not
   */
  getAppLink(meta, {
    appName = "wn.manager",
    encoded = true
  }={}) {
    return WnUtil.getLink(`/a/open/${appName}`, meta, {
      pathKey : "ph",
      encoded : true
    })
  },
  getAppLinkStr(meta, options) {
    return WnUtil.getAppLink(meta, options).toString()
  },
  getObjBadges(meta={}) {
    return {
      NW : null,
      NE : meta.ln ? "zmdi-open-in-new" : null,
      SW : null,
      SE : null
    }
  },
  getObjThumbInfo(meta={}, {
    exposeHidden = false,
    status = {},
    progress = {}
  }={}) {
    // Guard
    if(!meta || !meta.nm) {
      return
    }
    // Check the visibility
    let visibility = "show"
    if(meta.nm.startsWith(".")) {
      if(exposeHidden) {
        visibility = exposeHidden ? "weak" : "hide"
      }
    }
    // Generate new Thumb Item
    return {
      id    : meta.id,
      title : WnUtil.getObjDisplayName(meta),
      preview : WnUtil.genPreviewObj(meta),
      href : WnUtil.getAppLinkStr(meta),
      visibility,
      status   : status[meta.id],
      progress : progress[meta.id],
      badges : WnUtil.getObjBadges(meta)
    }
  },
  /***
   * Get object link for download
   */
  getDownloadLink(meta, {mode="force"}={}) {
    return WnUtil.getLink(`/o/content`, meta, {
      pathKey : "str",
      encoded : true,
      params : {d:mode}
    })
  },
  /***
   * Get Object link as `Plain Object`
   * 
   * @param url{String} : Target URL
   * @param meta{String|Object} : Object meta or id as string
   * @param options.pathKey{String} : Which key to send object path
   * @param options.encoded{Boolean} : Encode the path or not
   * @param options.params{Object} : Init params value
   * 
   * @return `TiLinkObj`
   */
  getLink(url, meta, {
    pathKey = "ph",
    encoded = false,
    params = {}
  }={}) {
    let params2 = {...params}
    if(!meta) {
      return {url, params2}
    }
    const __V = (val)=>{
      return encoded
        ? encodeURIComponent(val)
        : val
    }
    // META: "~/path/to/obj"
    if(/^(\/|~)/.test(meta)) {
      params2[pathKey] = __V(meta)
    }
    // META: "478e..6ea2"
    else if(_.isString(meta)) {
      params2[pathKey] = `id:${meta}`
    }
    // META: {id:"478e..6ea2"}
    else if(meta.id){
      params2[pathKey] = `id:${meta.id}`
    }
    // META: {ph:"/path/to/obj"}
    else if(meta.ph){
      params2[pathKey] = __V(meta.ph)
    }
    // Default return
    return Ti.Util.Link({
      url, 
      params : params2,
    })
  },
  /***
   * Wrap meta to standard tree node
   * 
   * @param meta{Object} - WnObj meta data
   * 
   * @return TreeNode: {id,name,leaf,rawData,children}
   */
  wrapTreeNode(meta) {
    if(_.isPlainObject(meta)) {
      let node = {
        id : meta.id,
        name : meta.nm,
        leaf : 'DIR' != meta.race,
        rawData : meta
      }
      if(!node.leaf) {
        node.children = []
      }
      if(node.id && node.name) {
        return node
      }
    }
  },
  /***
   * @param query{String|Function}
   */
  genQuery(query, {vkey="val", wrapArray=false}={}) {
    // Customized query
    if(_.isFunction(query)) {
      return query
    }
    // Array
    if(_.isArray(query)) {
      if(wrapArray) {
        return ()=>query
      }
      return query
    }
    // Command template
    if(_.isString(query)) {
      // Query by value 
      if(vkey) {
        return async (v) => {
          let cmdText = Ti.S.renderBy(query, {[vkey]:v})
          return await Wn.Sys.exec2(cmdText, {as:"json",input:v})
        }
      }
      // Query directly
      else {
        return async (v) => {
          return await Wn.Sys.exec2(query, {as:"json"})
        }
      }
    }
  }
}
////////////////////////////////////////////
export default WnUtil;