export default {
  ///////////////////////////////////////////////////
  data: ()=>({
    myHtml  : null,
    myTheme : null
  }),
  ///////////////////////////////////////////////////
  props : {
    "mediaBase" : {
      type : String,
      default : undefined
    },
    "content" : {
      type : String,
      default : ""
    }, 
    "blankAs" : {
      type : String,
      default : "i18n:blank"
    },
    "theme" : {
      type : String,
      default : "nice"
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getTopClass({
        [`theme-${this.myTheme}`] : this.myTheme
      })
    },
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    evalMediaSrc(src) {
      // Falsy src or base
      if(!src || !this.mediaBase) {
        return src
      }
      // Absolute path
      if(/^(https?:\/\/|\/)/i.test(src)) {
        return src
      }
      // Join the base
      return Ti.Util.appendPath(this.mediaBase, src)
    },
    //-----------------------------------------------
    renderMarkdown() {
      if(!Ti.Util.isBlank(this.content)) {
        let MdDoc = Cheap.parseMarkdown(this.content)
        //console.log(MdDoc)
        this.myHtml  = MdDoc.toBodyInnerHtml({
          mediaSrc : src => this.evalMediaSrc(src)
        })
        this.myTheme = MdDoc.getMeta("theme", this.theme)
      }
      // Show Blank
      else {
        this.myHtml = Ti.I18n.text(this.blankAs)
        this.myTheme = this.theme
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "content" : {
      handler : "renderMarkdown",
      immediate : true
    }
  }
  ///////////////////////////////////////////////////
}