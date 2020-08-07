export default {
  /////////////////////////////////////////
  props : {
    "src" : {
      type : String,
      default : undefined
    },
    "preview": {
      type: Object,
      default: null
    },
    "value": {
      type: Object,
      default: null
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
    TheSrc() {
      if(this.value && this.preview) {
        let po = _.cloneDeep(this.preview)
        _.defaults(po, {
          dftSrc: this.dftSrc
        })
        return Ti.WWW.evalObjPreviewSrc(this.value, po)
      }
      return this.src || this.dftSrc
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