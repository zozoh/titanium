export default {
  /////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value": {
      type: String,
      default: undefined
    },
    "type": {
      type : String,
      default : "html",
      validator : v => /^(html|markdown)$/.test(v)
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "apiTmpl": {
      type: String,
      default: undefined
    },
    "cdnTmpl": {
      type: String,
      default: undefined
    },
    "dftImgSrc": {
      type: String,
      default: undefined
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "theme": {
      type : String,
      default: "nice"
    },
    "loadingAs" : {
      type : Object,
      default : ()=>({
        className : "as-nil-mask as-big",
        icon : undefined,
        text : undefined
      })
    },
    "blankAs" : {
      type : Object,
      default : ()=>({
        comType : "TiLoading",
        comConf : {
          className : "as-nil-mask as-big",
          icon : "fas-coffee",
          text : null
        }
      })
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    ArticleClass() {
      return `ti-article-theme-${this.theme}`
    },
    //--------------------------------------
    isLoading() {
      return _.isUndefined(this.value)
    },
    //--------------------------------------
    isBlank() {
      return Ti.Util.isNil(this.value)
    },
    //--------------------------------------
    ArticleHtml() {
      if("html" == this.type) {
        return this.value
      }
      throw `type '${this.type}' not support yet!`
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    redrawContent() {
      // Guard
      if(!_.isElement(this.$refs.main))
        return

      // Create fragment 
      let $div = Ti.Dom.createElement({
        tagName : "div"
      })

      // Prepare HTML
      let html = this.ArticleHtml || ""
      html = html.replace("<script", "[SCRIPT")
      $div.innerHTML = html
      
      // Deal with image
      let $imgs = Ti.Dom.findAll("img[wn-obj-id]", $div);
      for(let $img of $imgs) {
        // Prepare the obj
        let obj = Ti.Dom.attrs($img, (key)=>{
          if(key.startsWith("wn-obj-")) {
            return key.substring(7)
          }
        })
        // Eval the src
        let src = Ti.WWW.evalObjPreviewSrc(obj, {
          previewKey : "..",
          previewObj : "..",
          apiTmpl : this.apiTmpl,
          cdnTmpl : this.cdnTmpl,
          dftSrc : this.dftImgSrc
        })
        $img.src = src
      }

      // Update the article content
      this.$refs.main.innerHTML = $div.innerHTML
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "ArticleHtml" : "redrawContent"
  },
  //////////////////////////////////////////
  mounted: function() {
    this.redrawContent()
  }
  //////////////////////////////////////////
}