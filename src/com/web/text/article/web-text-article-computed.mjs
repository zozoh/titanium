export default {
  //--------------------------------------
  TopClass() {
    return this.getTopClass()
  },
  //--------------------------------------
  ArticleClass() {
    return `is-theme-${this.theme}`
  },
  //--------------------------------------
  isLoading() {
    return _.isUndefined(this.value)
  },
  //--------------------------------------
  isBlank() {
    return Ti.S.isBlank(this.value)
  },
  //--------------------------------------
  ArticleHtml() {
    if("html" == this.type || "text/html" == this.type) {
      return this.value
    }
    if("text" == this.type || "text/plain" == this.type) {
      if(!this.value) {
        return ""
      }
      return this.value.replace(/\r?\n/g, '<br>')
    }
    throw `type '${this.type}' not support yet!`
  }
  //--------------------------------------
}