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
    "backgroundAtHeader" : {
      type : Boolean,
      default : false
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "headerHeight" : {
      type : [Number, String],
      default : undefined
    },
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
      return this.getTopClass({
        "is-bg-at-top"  : !this.backgroundAtHeader,
        "is-bg-at-head" : this.backgroundAtHeader
      })
    },
    //--------------------------------------
    TopStyle() {
      let backgroundImage = null
      if(this.TheBackgroundImageSrc && !this.backgroundAtHeader) {
        backgroundImage = `url('${this.TheBackgroundImageSrc}')`
      }
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height,
        backgroundImage
      })
    },
    //--------------------------------------
    HeaderStyle() {
      let backgroundImage = null
      if(this.TheBackgroundImageSrc && this.backgroundAtHeader) {
        backgroundImage = `url('${this.TheBackgroundImageSrc}')`
      }
      return Ti.Css.toStyle({
        height : this.headerHeight,
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
        console.log("haha")
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