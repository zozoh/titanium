export default {
  /////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value": {
      type: String,
      default: undefined
    },
    "type": {
      type : String,
      default : "html",
      validator : v => /^(html|markdown)$/.test(v)
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "theme": {
      type : String,
      default: "nice"
    },
    "loadingAs" : {
      type : Object,
      default : ()=>({
        className : "as-nil-mask as-big",
        icon : undefined,
        text : undefined
      })
    },
    "blankAs" : {
      type : Object,
      default : ()=>({
        comType : "TiLoading",
        comConf : {
          className : "as-nil-mask as-big",
          icon : "fas-coffee",
          text : null
        }
      })
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    ArticleClass() {
      return `ti-article-theme-${this.theme}`
    },
    //--------------------------------------
    isLoading() {
      return _.isUndefined(this.value)
    },
    //--------------------------------------
    isBlank() {
      return Ti.Util.isNil(this.value)
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
  //////////////////////////////////////////
}