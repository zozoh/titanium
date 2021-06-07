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
    "type" : {
      type : [String, Function],
      default : "=type"
    },
    //-------------------------------------
    // Behavior
    //-------------------------------------
    /* prop setting for <WebMediaImage> */
    "image" : {
      type: Object,
      default: undefined
    },
    "video" : {
      type: Object,
      default: undefined
    },
    "audio" : {
      type: Object,
      default: undefined
    },
    "youtube" : {
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
      return this.getSrcValueBy(this.mime)
    },
    //--------------------------------------
    MediaType() {
      return this.getSrcValueBy(this.type)
    },
    //--------------------------------------
    MediaCom() {
      let mime = this.MediaMime
      let type = this.MediaType
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
      // Youtube
      //
      if("youtube" == type && this.src && this.src.yt_video_id) {
        return {
          comType : "NetYoutubePlayer",
          comConf : {
            value : _.assign({}, this.youtube, {
              id : this.src.yt_video_id,
              thumbUrl : this.src.thumb
            })
          }
        }
      }
      //
      // Image
      //
      else if(/^image\/.+$/.test(mime)) {
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
          comConf : _.assign({}, this.video, {
            src  : this.MediaSrc,
            mime : this.MediaMime
          })
        }
      }
      //
      // Audio
      //
      if(/^audio\/.+$/.test(mime)) {
        return {
          comType : "TiMediaAudio",
          comConf : _.assign({}, this.audio, {
            src : this.MediaSrc
          })
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
    },
    //--------------------------------------
    getSrcValueBy(key) {
      // Customized
      if(_.isFunction(key)) {
        return key(this.src)
      }
      // Explain
      if(this.src) {
        if(_.isString(this.src)) {
          return key
        }
        return Ti.Util.explainObj(this.src, key)
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}