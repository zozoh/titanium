export const WnUtil = {
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
  genPreviewObj(it) {
    if(it.icon) {
      return {
        type  : "icon",
        value : WnUtil.getIconName(it.icon)
      }
    }
    return {
      type : "image",
      value : '/o/thumbnail/id:' + it.id
    }
  },
  /***
   * return the object readable name
   */
  getObjDisplayName(meta) {
    return meta.title || meta.nm
  }
}