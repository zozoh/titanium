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
  }
}