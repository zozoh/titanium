/////////////////////////////////////////////////////
function ResetQuillConfig(Quill) {
  //.................................................
  // Reset once
  if(Quill.__has_been_reset) 
    return
  //.................................................
  // hljs.configure({   // optionally configure hljs
  //   languages: ['javascript', 'ruby', 'python']
  // });
  //.................................................
  // Reset Indent    
  const Indent = Quill.import('formats/indent')
  Indent.keyName = "li-indent"
  Indent.whitelist = [1,2,3,4,5,6]
  console.log(Indent)
  //.................................................
  // Mark it
  Quill.__has_been_reset = true
}
/////////////////////////////////////////////////////
const _M = {
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
      default : ()=>[
        "Heading", "|", "B", "I", "|", "Link", "Code", "|",
        "BlockQuote", "CodeBlock", "|", "Indent", "Outdent", "UL", "OL"
        ]
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
          "Code" : {
            icon : "zmdi-code",
            action : "$parent:setSelectionAsCode"
          },
          //.........................................
          "Heading" : {
            type : "group",
            icon : "fas-hashtag",
            text : "i18n:wordp-heading",
            items : [{
                text: "i18n:wordp-h1",
                action : "$parent:setSelectionAsHeading(1)"
              }, {
                text: "i18n:wordp-h2",
                action : "$parent:setSelectionAsHeading(2)"
              }, {
                text: "i18n:wordp-h3",
                action : "$parent:setSelectionAsHeading(3)"
              }, {
                text: "i18n:wordp-h4",
                action : "$parent:setSelectionAsHeading(4)"
              }, {
                text: "i18n:wordp-h5",
                action : "$parent:setSelectionAsHeading(5)"
              }, {
                text: "i18n:wordp-h6",
                action : "$parent:setSelectionAsHeading(6)"
              }, {
                text: "i18n:wordp-h0",
                action : "$parent:setSelectionAsHeading(0)"
              }]
          },
          //.........................................
          "BlockQuote" : {
            icon : "fas-quote-right",
            action : "$parent:setSelectionAsBlockQuote"
          },
          //.........................................
          "CodeBlock" : {
            icon : "fas-code",
            action : "$parent:setSelectionAsCodeBlock"
          },
          //.........................................
          "Indent" : {
            icon : "fas-indent",
            action : "$parent:setSelectionAsIndent('+1')"
          },
          //.........................................
          "Outdent" : {
            icon : "fas-outdent",
            action : "$parent:setSelectionAsIndent('-1')"
          },
          //.........................................
          "UL" : {
            icon : "fas-list-ul",
            action : "$parent:setSelectionAsUL"
          },
          //.........................................
          "OL" : {
            icon : "fas-list-ol",
            action : "$parent:setSelectionAsOL"
          },
          //.........................................
          //.........................................
        })[v]
        //...........................................
        if(it) {
          list.push(it)
        }
        //...........................................
      })
      list.push({
        text: "HL",
        action : "$parent:highlightCode"
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
      let href = await Ti.Prompt("i18n:wordp-link");
      if(!Ti.Util.isNil(href)) {
        let op = this.$editor.format("link", href)
        console.log(op)
      }
    },
    //-----------------------------------------------
    setSelectionAsCode() {
      this.$editor.format("code", true)
    },
    //-----------------------------------------------
    setSelectionAsBlockQuote() {
      this.$editor.format("blockquote", true)
    },
    //-----------------------------------------------
    setSelectionAsCodeBlock() {
      this.$editor.format("code-block", "javascript")
    },
    //-----------------------------------------------
    setSelectionAsIndent(value="+1") {
      console.log("haha")
      this.$editor.format("indent", value)
    },
    //-----------------------------------------------
    setSelectionAsUL() {
      this.$editor.format("list", 'bullet')
    },
    //-----------------------------------------------
    setSelectionAsOL() {
      this.$editor.format("list", "ordered")
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
    // Highlight
    //-----------------------------------------------
    highlightCode() {
      for(let $code of this.$refs.stage.querySelectorAll("pre")) {
        console.log($code)
        hljs.highlightBlock($code)
      }
    },
    //-----------------------------------------------
    // Quill
    //-----------------------------------------------
    quillChanged(delta) {
      console.log("changed", JSON.stringify(delta, null, '  '))
      let MdDoc = Cheap.parseDelta(delta)
      window.MdDoc = MdDoc
      console.log(MdDoc.toString())
      let markdown = MdDoc.toMarkdown()
      console.log(markdown)

      this.$notify("change", markdown)
    },
    //-----------------------------------------------
    installQuillEditor() {
      //.............................................
      // Reset the Quill Default
      ResetQuillConfig(Quill)
      //Quill.register(MyIndent)
      //.............................................
      this.$editor = new Quill(this.$refs.stage, {
        modules: {
          syntax: false
          // toolbar: [
          //   [{ header: [1, 2, false] }],
          //   ['bold', 'italic', 'underline'],
          //   ['image', 'code-block'],
          //   [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          //   [{ 'indent': '-1'}, { 'indent': '+1' }],
          // ]
        },
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
export default _M;