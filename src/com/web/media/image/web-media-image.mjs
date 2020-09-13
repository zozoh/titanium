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
    "href": {
      type: String,
      default: undefined
    },
    "newtab": {
      type: [String, Boolean],
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
      return this.getTopClass({
        "has-href" : this.TheHref ? true : false,
        "no-href"  : this.TheHref ? false : true
      })
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
        let str = this.text
        if(_.isPlainObject(this.src)) {
          str = Ti.Util.explainObj(this.src, this.text)
        }
        if(this.i18n) {
          str = Ti.I18n.text(str)
        }
        return str
      }
    },
    //--------------------------------------
    TheHref() {
      if(this.href) {
        let href = this.href
        if(_.isPlainObject(this.src)) {
          href = Ti.Util.explainObj(this.src, this.href)
        }
        return href
      }
    },
    //--------------------------------------
    isNewTab() {
      let newtab = this.newtab
      if(_.isString(newtab)) {
        if(_.isPlainObject(this.src)) {
          newtab = Ti.Util.explainObj(this.src, this.newtab)
        }
      }
      return newtab ? true : false
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}