const _M = {
  //////////////////////////////////////////
  props : {
    "value" : {
      type : Object,
      default : ()=>({})
    },
    "previewKey" : {
      type:String,
      default: "thumb"
    },
    "previewObj" : {
      type:String,
      default: "thumb_obj"
    },
    "mapping": {
      type: Object,
      default: ()=>({
        id : "id",
        title : "title",
        brief : "brief",
        watchCount : "watch_c",
        readTime    : "duration",
        date : "pubat"
      })
    },
    "hrefTmpl": {
      type: String,
      default: undefined
    },
    "emitName": {
      type: String,
      default: undefined
    },
    "payload": undefined,
    "newtab": {
      type: Boolean,
      default: false
    },
    "apiTmpl": {
      type: String,
      default: undefined
    },
    "cdnTmpl": {
      type: String,
      default: undefined
    },
    "dftThumbSrc": {
      type: String,
      default: undefined
    },
    "imgStyle" : {
      type: Object,
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
    Article() {
      let it = Ti.Util.translate(this.value, this.mapping)
      return it || {}
    },
    //--------------------------------------
    ThumbSrc() {
      return Ti.WWW.evalObjPreviewSrc(this.value, {
        previewKey : this.previewKey,
        previewObj : this.previewObj,
        apiTmpl    : this.apiTmpl,
        cdnTmpl    : this.cdnTmpl,
        dftSrc     : this.dftThumbSrc
      })
    },
    //--------------------------------------
    ThumbImageStyle() {
      return Ti.Css.toStyle(this.imgStyle)
    },
    //--------------------------------------
    ArticleLinkHref() {
      if(this.hrefTmpl) {
        return Ti.S.renderBy(this.hrefTmpl, this.value)
      }
    },
    //--------------------------------------
    ArticleLinkTarget() {
      return this.newtab ? "_blank" : undefined
    },
    //--------------------------------------
    hasInfo() {
      return this.DateText
        || this.Article.watchCount
        || this.Article.readTime
    },
    //--------------------------------------
    DateText() {
      if(this.Article.date)
        return Ti.DateTime.timeText(this.Article.date)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickLink(evt) {
      if(this.emitName) {
        evt.preventDefault()
        let payload = Ti.Util.explainObj(this.value, this.payload)
        this.$notify(this.emitName, payload)
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;