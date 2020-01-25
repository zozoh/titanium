export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  props : {
    "className" : null,
    "blankAs" : {
      type : String,
      default : "i18n:nil"
    },
    "value" : null,
    "format" : undefined,
    "prefixIcon" : {
      type : String,
      default : null
    },
    "prefixText" : {
      type : String,
      default : null
    },
    "suffixText" : {
      type : String,
      default : null
    },
    "suffixIcon" : {
      type : String,
      default : null
    },
    "href" : {
      type : String,
      default : null
    },
    "newTab" : {
      type : Boolean,
      default : false
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-blank" : this.isBlank
      }, this.className)
    },
    //--------------------------------------
    isBlank() {
      if(_.isNumber(this.value))
        return false
      return this.value ? false : true
    },
    //--------------------------------------
    theLinkTarget() {
      if(this.newTab) {
        return "_blank"
      }
    },
    //--------------------------------------
    hasHref() {
      return this.href ? true : false
    },
    //--------------------------------------
    theValue() {
      // Blank value
      if(this.isBlank) {
        return Ti.I18n.text(this.blankAs)
      }
      // Look up dictionary
      let str = this.value
      // Format to display
      if(this.format || _.isDate(str)) {
        str = Ti.Types.toStr(str, this.format)
      }
      // I18n ...
      return Ti.I18n.text(str)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}