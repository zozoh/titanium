const _M = {
  //////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "title" : String,
    "content" : String,
    "contentType" : {
      type : String,
      default : "text",
      validator : v=>/^(text|html|markdown)$/.test(v)
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "href" : String,
    "newtab" : {
      type: Boolean,
      default: false
    },
    "emitName" : String,
    "payload" : undefined,
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "headerStyle" : Object,
    "articleStyle" : Object,
    "footerStyle" : Object,
    "btnIcon" : String,
    "btnText" : String,
    "backgroundSrc" : {
      type : [String, Object]
    },
    "backgroundPreview" : Object,
    "backgroundAtHeader" : Boolean,
    //-----------------------------------
    // Measure
    //-----------------------------------
    "headerHeight" : {
      type : [Number, String]
    },
    "width" : {
      type : [Number, String]
    },
    "height" : {
      type : [Number, String]
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-bg-at-top"  : !this.backgroundAtHeader,
        "is-bg-at-head" : this.backgroundAtHeader,
        "has-content" : this.hasContent,
        "nil-content" : !this.hasContent,
        "has-button" : this.hasButton,
        "nil-button" : !this.hasButton,
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
    TheHeaderStyle() {
      let backgroundImage = null
      if(this.TheBackgroundImageSrc && this.backgroundAtHeader) {
        backgroundImage = `url('${this.TheBackgroundImageSrc}')`
      }
      return Ti.Css.toStyle(_.assign({
        height : this.headerHeight,
        backgroundImage
      }, this.headerStyle))
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
    LinkTarget() {
      return this.newtab ? '_blank' : undefined
    },
    //--------------------------------------
    hasContent() {
      return !Ti.S.isBlank(this.content)
    },
    //--------------------------------------
    HtmlContent() {
      if(this.hasContent) {
        if("text" == this.contentType) {
          return this.content.replace(/\r?\n/g, '<br>')
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