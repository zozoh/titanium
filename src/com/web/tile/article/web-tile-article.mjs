const _M = {
  //////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "title" : {
      type : String,
      default : undefined
    },
    "content" : {
      type : String,
      default : undefined
    },
    "contentType" : {
      type : String,
      default : "text",
      validator : v=>/^(text|html|markdown)$/.test(v)
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "href" : {
      type : String,
      default : undefined,
    },
    "emitName" : {
      type : String,
      default : undefined,
    },
    "payload" : undefined,
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "btnIcon" : {
      type : String,
      default : undefined,
    },
    "btnText" : {
      type : String,
      default : undefined,
    },
    "backgroundSrc" : {
      type : [String, Object],
      default : undefined
    },
    "backgroundPreview" : {
      type : Object,
      default : undefined
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "width" : {
      type : [Number, String],
      default : undefined
    },
    "height" : {
      type : [Number, String],
      default : undefined
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
      let backgroundImage = null
      if(this.TheBackgroundImageSrc) {
        backgroundImage = `url('${this.TheBackgroundImageSrc}')`
      }
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height,
        backgroundImage
      })
    },
    //--------------------------------------
    hasButton() {
      return this.btnText || this.btnIcon
    },
    //--------------------------------------
    TheBackgroundImageSrc() {
      return Ti.WWW.evalObjPreviewSrc(this.backgroundSrc, this.backgroundPreview)
    },
    //--------------------------------------
    HtmlContent() {
      if(this.content) {
        if("text" == this.contentType) {
          return this.content.replaceAll(/\r?\n/g, '<br>')
        }
        if("markdown" == this.contentType) {
          // TODO convert markdown
          return this.content
        }
        // Raw HTML
        return this.content
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;