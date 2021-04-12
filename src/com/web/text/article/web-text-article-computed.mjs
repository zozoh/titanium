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
    if("html" == this.type) {
      return this.value
    }
    throw `type '${this.type}' not support yet!`
  }
  //--------------------------------------
}