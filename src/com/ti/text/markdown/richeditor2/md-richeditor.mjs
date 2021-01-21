/////////////////////////////////////////////////////
const _M = {
  ///////////////////////////////////////////////////
  data: ()=>({
    myMeta : {},
    syncForbid : 0,
    myToolbarStatus : {}
  }),
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getTopClass({
        "nil-content" : this.isContentNil,
        "has-content" : !this.isContentNil
      })
    },
    //-----------------------------------------------
    ThemeClass() {
      if(this.ThemeName) {
        return `ti-markdown-theme-${this.ThemeName}`
      }
    },
    //-----------------------------------------------
    ThemeName() {
      return _.get(this.myMeta, "theme") || this.theme
    },
    //-----------------------------------------------
    hasToolbar() {
      return !_.isEmpty(this.ToolbarMenuData)
    },
    //-----------------------------------------------
    isContentLoading() {
      return _.isUndefined(this.value)
    },
    //-----------------------------------------------
    isContentNil() {
      return Ti.Util.isNil(this.value)
    },
    //-----------------------------------------------
    BlankComStyle() {
      return {
        position: "absolute",
        top:0, right:0, bottom:0, left:0
      }
    },
    //-----------------------------------------------
    TheMarkdownMediaSrc() {
      if(_.isFunction(this.markdownMediaSrc)){
        return this.markdownMediaSrc
      }

      if(_.isString(this.markdownMediaSrc)) {
        return Ti.Util.genInvoking(this.markdownMediaSrc, {
          partial: "right"
        })
      }
    },
    //-----------------------------------------------
    ThePreviewMediaSrc() {
      if(_.isFunction(this.previewMediaSrc)){
        return this.previewMediaSrc
      }

      if(_.isString(this.previewMediaSrc)) {
        return Ti.Util.genInvoking(this.previewMediaSrc, {
          partial: "right"
        })
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    // Events
    //-----------------------------------------------
    async OnClickPre() {
      let json = await Ti.App.Open({
        width: 600, height: "96%",
        title : "Edit delta",
        result : JSON.stringify(this.myDelta),
        comType : "TiInputText",
        comConf : {
          height: "100%"
        },
        components : "@com:ti/input/text"
      })

      console.log(json)
    },
    //-----------------------------------------------
    // Utility
    //-----------------------------------------------
    async renderMarkdown() {
      //console.log("!!!!!!!!!!!!!!!!!!!!!! renderMarkdown")
      if(!Ti.Util.isBlank(this.value)) {
        // Parse markdown
        let MdDoc = Cheap.parseMarkdown(this.value)
        //console.log(MdDoc.toString())
        window.MdDoc = MdDoc
        this.myMeta = _.cloneDeep(MdDoc.getMeta())

        // Get delta
        let delta = await MdDoc.toDelta({
          mediaSrc: this.ThePreviewMediaSrc
        })
        //console.log(JSON.stringify(delta, null, '   '))

        // Update Quill editor content
        this.$editor.setContents(delta);
        
      }
      // Show Blank
      else {
        this.myMeta = {}
        this.$editor.setContents([]);
      }
    },
    //-----------------------------------------------
    syncMarkdown() {
      if(this.syncForbid > 0) {
        //console.log("!forbid! syncMarkdown", this.syncForbid)
        this.syncForbid --
        return
      }
      this.renderMarkdown()
    },
    //-----------------------------------------------
    // Highlight
    //-----------------------------------------------
    // highlightCode() {
    //   for(let $code of this.$refs.stage.querySelectorAll("pre")) {
    //     console.log($code)
    //     hljs.highlightBlock($code)
    //   }
    // },
    
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "value" : {
      handler : "syncMarkdown"
    },
    "isContentNil": function(newVal, oldVal){
      //console.log("isContentNil", newVal, oldVal)
      if(newVal) {
        this.syncForbid = 0
      }
    }
  },
  ///////////////////////////////////////////////////
  mounted() {
    this.syncForbid = 0;
    this.installQuillEditor()
    this.syncMarkdown()
  },
  ///////////////////////////////////////////////////
  beforeDestroy() {
    this.syncForbid = 0;
  }
  ///////////////////////////////////////////////////
}
export default _M;