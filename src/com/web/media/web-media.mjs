export default {
  /////////////////////////////////////////
  props : {
    //-------------------------------------
    // Data
    //-------------------------------------
    "src" : {
      type : [String, Object],
      default : undefined
    },
    "preview": {
      type: Object,
      default: undefined
    },
    "mime": {
      type : [String, Function],
      default : "=mime"
    },
    //-------------------------------------
    // Behavior
    //-------------------------------------
    /* prop setting for <WebMediaImage> */
    "image" : {
      type: Object,
      default: undefined
    },
    "showIconPrev" : {
      type : Boolean,
      default : false
    },
    "showIconNext" : {
      type : Boolean,
      default : false
    },
    //-------------------------------------
    // Aspect
    //-------------------------------------
    "iconPrev": {
      type: String,
      default: "zmdi-chevron-left"
    },
    "iconNext": {
      type: String,
      default: "zmdi-chevron-right"
    },
    "blankAs" : {
      type : Object,
      default : ()=>({
        icon : "fas-photo-video",
        text : "i18n:media"
      })
    },
    "unknownAs" : {
      type : Object,
      default : ()=>({
        icon : "far-question-circle",
        text : "i18n:unknown"
      })
    },
    //-------------------------------------
    // Measure
    //-------------------------------------
    "width" : {
      type : [String, Number],
      default : ""
    },
    "height" : {
      type : [String, Number],
      default : ""
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
        width: this.width,
        height: this.height
      })
    },
    //--------------------------------------
    MediaSrc() {
      return Ti.WWW.evalObjPreviewSrc(this.src, this.preview)
    },
    //--------------------------------------
    MediaMime() {
      // Customized
      if(_.isFunction(this.mime)) {
        return this.mime(this.src)
      }
      // Explain
      if(this.src) {
        if(_.isString(this.src)) {
          return this.mime
        }
        return Ti.Util.explainObj(this.src, this.mime)
      }
    },
    //--------------------------------------
    MediaCom() {
      let mime = this.MediaMime
      // Default component
      if(!mime) {
        return {
          comType : "TiLoading",
          comConf : _.assign({
            className : "as-hug",
          }, this.blankAs)
        }
      }
      //
      // Image
      //
      if(/^image\/.+$/.test(mime)) {
        return {
          comType : "WebMediaImage",
          comConf : _.assign({}, this.image, {
            src : this.MediaSrc
          })
        }
      }
      //
      // Video
      //
      if(/^video\/.+$/.test(mime)) {
        return {
          comType : "TiMediaVideo",
          comConf : {
            src  : this.MediaSrc,
            mime : this.MediaMime
          }
        }
      }
      //
      // Audio
      //
      if(/^audio\/.+$/.test(mime)) {
        return {
          comType : "TiMediaAudio",
          comConf : {
            src : this.MediaSrc
          }
        }
      }
      //
      // Unknown
      //
      return {
        comType : "TiLoading",
        comConf : _.assign({
          className : "as-hug",
        }, this.unknownAs)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickPrev() {
      this.$notify("go:prev");
    },
    //--------------------------------------
    OnClickNext() {
      this.$notify("go:next");
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}