export default {
  props : {
    "value" : null,
    "blankAs" : {
      type : String,
      default : "i18n:nil"
    }
  },
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
      let str = Ti.Types.toStr(this.value)
      return Ti.I18n.text(str)
    }
  }
}