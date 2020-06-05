export default {
  ///////////////////////////////////////////////////
  data: ()=>({
    myHtml  : null,
    myTheme : null
  }),
  ///////////////////////////////////////////////////
  props : {
    "previewMediaSrc" : {
      type : [String, Function],
      default : undefined
    },
    "value" : {
      type : String,
      default : ""
    }, 
    "placeholder" : {
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
      return this.getTopClass()
    },
    //-----------------------------------------------
    ThemeClass() {
      if(this.myTheme) {
        return `ti-markdown-theme-${this.myTheme}`
      }
    },
    //-----------------------------------------------
    ThePreviewMediaSrc() {
      let transSrc = _.identity;
      // String mode
      if(_.isString(this.previewMediaSrc)) {
        transSrc = src => {
          return Ti.S.renderBy(this.previewMediaSrc, {src})
        }
      }
      // Function Mode
      else if(_.isFunction(this.previewMediaSrc)){
        transSrc = this.previewMediaSrc
      }

      return async src => {
        //console.log("!!!!src", src)
        // Outsite link
        if(/^(https?:)(\/\/)/.test(src))
          return src

        // translate it
        return transSrc(src)
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    async renderMarkdown() {
      if(!Ti.Util.isBlank(this.value)) {
        let MdDoc = Cheap.parseMarkdown(this.value)
        console.log(MdDoc.toString())
        this.myHtml  = await MdDoc.toBodyInnerHtml({
          mediaSrc : this.ThePreviewMediaSrc
        })
        this.myTheme = MdDoc.getMeta("theme", this.theme)
      }
      // Show Blank
      else {
        this.myHtml = Ti.I18n.text(this.placeholder)
        this.myTheme = this.theme
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "value" : {
      handler : "renderMarkdown",
      immediate : true
    }
  }
  ///////////////////////////////////////////////////
}