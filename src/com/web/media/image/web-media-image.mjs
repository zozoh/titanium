export default {
  /////////////////////////////////////////
  props : {
    "src" : {
      type : [String, Object],
      default : undefined
    },
    "preview": {
      type: Object,
      default: undefined
    },
    "text": {
      type: String,
      default: undefined
    },
    "i18n": {
      type: Boolean,
      default: true
    },
    "width": {
      type: [String, Number],
      default: undefined
    },
    "height": {
      type: [String, Number],
      default: undefined
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //--------------------------------------
    TheSrc() {
      return Ti.WWW.evalObjPreviewSrc(this.src, this.preview)
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