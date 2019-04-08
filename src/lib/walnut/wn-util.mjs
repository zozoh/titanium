// Ti required(Ti.Icons)
//---------------------------------------
export const WnUtil = {
  isMimeText(mime) {
    return /^text\//.test(mime) 
           || "application/x-javascript" == mime
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
      return Ti.Icons.get(icon)
    }
    // Default
    return Ti.Icons.get(meta)
  },
  getIconObj(meta) {
    if(meta && meta.icon) {
      // customized icon object
      if(_.isPlainObject(meta.icon)) {
        return _.assign(
          Ti.Icons.get()
          , meta.icon)
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
  /***
   * return the object readable name
   */
  getObjDisplayName(meta) {
    return meta.title || meta.nm
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
  }
}