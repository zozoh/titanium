export default {
  /////////////////////////////////////////
  props : {
    "src" : {
      type : String,
      default : undefined
    },
    "dftSrc" : {
      type : String,
      default : undefined
    },
    "text": {
      type: String,
      default: undefined
    },
    "i18n": {
      type: Boolean,
      default: true
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    TheText() {
      if(this.text) {
        return this.i18n
          ? Ti.I18n.text(this.text)
          : this.text
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}