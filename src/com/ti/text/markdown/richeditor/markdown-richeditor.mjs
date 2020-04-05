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
    "placeholder" : {
      type : String,
      default : "i18n:blank"
    },
    "theme" : {
      type : String,
      default : "nice"
    },
    "toolbar" : {
      type : Array,
      default : ()=>["Heading", "|", "B", "I", "|", "Link"]
    },
    "toolbarAlign" : {
      type : String,
      default: "left",
      validator : v => /^(left|right|center)$/.test(v)
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
    ThemeClass() {
      if(this.myTheme) {
        return `ti-markdown-theme-${this.myTheme}`
      }
    },
    //-----------------------------------------------
    hasToolbar() {
      return !_.isEmpty(this.ToolbarMenuData)
    },
    //-----------------------------------------------
    ToolbarMenuData() {
      let list = []
      _.forEach(this.toolbar, v => {
        let it = ({
          //.........................................
          "|" : {type : "line"},
          //.........................................
          "B" : {
            icon : "fas-bold",
            action : "$parent:setSelectionAsBold"
          },
          //.........................................
          "I" : {
            icon : "fas-italic",
            action : "$parent:setSelectionAsItalic"
          },
          //.........................................
          "Link" : {
            icon : "fas-link",
            action : "$parent:setSelectionAsLink"
          },
          //.........................................
          "Heading" : {
            type : "group",
            icon : "fas-hashtag",
            text : "i18n:editor-heading",
            items : [{
                text: "H1",
                action : "$parent:setSelectionAsHeading(1)"
              }, {
                text: "H2",
                action : "$parent:setSelectionAsHeading(2)"
              }, {
                text: "H3",
                action : "$parent:setSelectionAsHeading(3)"
              }]
          }
          //.........................................
          //.........................................
        })[v]
        //...........................................
        if(it) {
          list.push(it)
        }
        //...........................................
      })
      return list;
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    // Selection Operation
    //-----------------------------------------------
    setSelectionAsBold(){
      let sel = this.$editor.getSelection()
      this.$editor.format("bold", true)
    },
    //-----------------------------------------------
    setSelectionAsItalic(){
      this.$editor.format("italic", true)
    },
    //-----------------------------------------------
    setSelectionAsHeading(level=1) {
      this.$editor.format("header", level)
    },
    //-----------------------------------------------
    async setSelectionAsLink(){
      let href = await Ti.Prompt("i18n:editor-link");
      if(!Ti.Util.isNil(href)) {
        let op = this.$editor.format("link", href)
        console.log(op)
      }
    },
    //-----------------------------------------------
    // Utility
    //-----------------------------------------------
    //-----------------------------------------------
    // Rendering
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
    },
    //-----------------------------------------------
    // Quill
    //-----------------------------------------------
    quillChanged(delta) {
      console.log("changed", delta)
    },
    //-----------------------------------------------
    installQuillEditor() {
      //.............................................
      this.$editor = new Quill(this.$refs.stage, {
        placeholder : Ti.I18n.text(this.placeholder)
      });
      //.............................................
      this.debounceQuillChanged = _.debounce((delta)=>this.quillChanged(delta), 1000)
      //.............................................
      this.$editor.on("text-change", (newDelta, oldDelta, source)=>{
        let delta = oldDelta.compose(newDelta)
        this.debounceQuillChanged(delta)
      })
      //.............................................
      // this.$editor.on("selection-change", (range, oldRange, source)=>{
      //   console.log("selection-change", source, oldRange, range)
      // })
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "content" : {
      handler : "renderMarkdown",
      immediate : true
    }
  },
  ///////////////////////////////////////////////////
  mounted: function() {
    this.installQuillEditor()
  }
  ///////////////////////////////////////////////////
}