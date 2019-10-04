export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  props : {
    "blankAs" : {
      type : String,
      default : "i18n:nil"
    },
    "value" : null,
    "format" : undefined
  },
  //////////////////////////////////////////
  computed : {
    isBlank() {
      if(_.isNumber(this.value))
        return false
      return this.value ? false : true
    },
    topClass() {
      return {
        "is-blank" : this.isBlank
      }
    },
    theValue() {
      if(this.isBlank) {
        return Ti.I18n.text(this.blankAs)
      }
      let str = Ti.Types.toStr(this.value, this.format)
      return Ti.I18n.text(str)
    }
  }
  //////////////////////////////////////////
}