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
  //.................................................
  // Mark it
  Quill.__has_been_reset = true
}
/////////////////////////////////////////////////////
const BUILTIN_TOOLBAR_ACTIONS = {
  //.........................................
  "|" : {type : "line"},
  //.........................................
  "B" : {
    icon : "fas-bold",
    notify: "bold",
    highlight : "bold",
    disabled : "italic"
  },
  //.........................................
  "I" : {
    icon : "fas-italic",
    notify : "italic",
    highlight : "italic",
    disabled : "bold"
  },
  //.........................................
  "Link" : {
    icon : "fas-link",
    notify : "link",
    highlight : "link"
  },
  //.........................................
  "Code" : {
    icon : "zmdi-code",
    notify : "code",
    highlight : "code"
  },
  //.........................................
  "Heading" : {
    type : "group",
    icon : "fas-hashtag",
    text : "i18n:wordp-heading",
    items : [{
        text: "i18n:wordp-h1",
        notify: "header",
        highlight : "h1",
        value: 1
      }, {
        text: "i18n:wordp-h2",
        notify: "header",
        highlight : "h2",
        value: 2
      }, {
        text: "i18n:wordp-h3",
        notify: "header",
        highlight : "h3",
        value: 3
      }, {
        text: "i18n:wordp-h4",
        notify: "header",
        highlight : "h4",
        value: 4
      }, {
        text: "i18n:wordp-h5",
        notify: "header",
        highlight : "h5",
        value: 5
      }, {
        text: "i18n:wordp-h6",
        notify: "header",
        highlight : "h6",
        value: 6
      }, {
        text: "i18n:wordp-h0",
        notify: "header",
        highlight : "h0",
        value:  0
      }]
  },
  //.........................................
  "BlockQuote" : {
    icon : "fas-quote-right",
    notify : "blockquote",
    highlight : "blockquote"
  },
  //.........................................
  "CodeBlock" : {
    icon : "fas-code",
    notify : "code_block",
    highlight : "code-block"
  },
  //.........................................
  "Indent" : {
    icon : "fas-indent",
    notify: "indent"
  },
  //.........................................
  "Outdent" : {
    icon : "fas-outdent",
    notify: "outdent"
  },
  //.........................................
  "UL" : {
    icon : "fas-list-ul",
    notify : "list",
    value : "bullet",
    highlight: {list:"bullet"}
  },
  //.........................................
  "OL" : {
    icon : "fas-list-ol",
    notify : "list",
    value : "ordered",
    highlight: {list:"ordered"}
  }
  //.........................................
}
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
        "nil-content" : this.isNilContent,
        "has-content" : !this.isNilContent
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
    isNilContent() {
      return Ti.Util.isNil(this.value)
    },
    //-----------------------------------------------
    ToolbarActions() {
      return _.merge({}, BUILTIN_TOOLBAR_ACTIONS, this.actions)
    },
    //-----------------------------------------------
    ToolbarMenuData() {
      let list = []
      _.forEach(this.toolbar, v => {
        let it = _.get(this.ToolbarActions, v)
        //...........................................
        if(it) {
          list.push(it)
        }
        //...........................................
      })
      // list.push({
      //   text: "HL",
      //   action : "$parent:highlightCode"
      // })
      return list;
    },
    //-----------------------------------------------
    TheMarkdownMediaSrc() {
      if(_.isFunction(this.markdownMediaSrc)){
        return this.markdownMediaSrc
      }

      if(_.isString(this.markdownMediaSrc)) {
        return Ti.Util.genInvoking(this.markdownMediaSrc, {
          partialRight: true
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
          partialRight: true
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
    OnToolbarChange({name, value}={}) {
      //console.log("OnToolbarChange", {name, value})
      const fn = ({
        //...........................................  
        bold  ($q, val){$q.format("bold", val)},
        italic($q, val){$q.format("italic", val)},
        code($q, val){$q.format("code", val)},
        //...........................................
        header($q, val) {$q.format("header", val)},
        //...........................................
        blockquote($q, val){$q.format("blockquote", val)},
        code_block($q, val){$q.format("code-block", val)},
        //..........................................
        async link($q, val){
          let range = $q.getSelection()
          if(!range) {
            return await Ti.Toast.Open("i18n:wordp-nil-sel", "warn")
          }
          // Insert link
          if(val) {
            if(range.length > 0) {
              let href = await Ti.Prompt("i18n:wordp-link");
              if(!Ti.Util.isNil(href)) {
                let op = $q.format("link", href)
              }
            }
            // Warn user
            else {
              return await Ti.Toast.Open("i18n:wordp-nil-sel", "warn")
            }
          }
          // Remove link
          else {
            $q.format("link", false)
          }
        },
        //...........................................
        indent ($q){$q.format("indent", "+1")},
        outdent($q){$q.format("indent", "-1")},
        //...........................................
        list($q, val="bullet"){$q.format("list", val)}
        //...........................................
      })[name]
      //.............................................
      // Invoke
      if(_.isFunction(fn)) {
        fn(this.$editor, value)
        this.quillUpdateFormat()
      }
      //.............................................
    },
    //-----------------------------------------------
    // Utility
    //-----------------------------------------------
    async renderMarkdown() {
      console.log("!!!!!!!!!!!!!!!!!!!!!! renderMarkdown")
      if(!Ti.Util.isBlank(this.value)) {
        // Parse markdown
        let MdDoc = Cheap.parseMarkdown(this.value)
        console.log(MdDoc.toString())
        window.MdDoc = MdDoc
        this.myMeta = _.cloneDeep(MdDoc.getMeta())

        // Get delta
        let delta = await MdDoc.toDelta({
          mediaSrc: this.ThePreviewMediaSrc
        })
        console.log(JSON.stringify(delta, null, '   '))

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
        console.log("!forbid! syncMarkdown", this.syncForbid)
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
    // Quill
    //-----------------------------------------------
    async quillChanged(delta) {
      //console.log("changed", JSON.stringify(delta, null, '  '))
      //console.log("quillChanged")
      // Guard
      if(this.isNilContent) {
        return
      }

      // Delat => CheapDocument
      let MdDoc = Cheap.parseDelta(delta)
      MdDoc.setDefaultMeta(this.myMeta)
      this.myMeta = MdDoc.getMeta()
      //console.log(MdDoc.toString())
      
      // CheapDocument => markdown
      let markdown = await MdDoc.toMarkdown({
        mediaSrc: this.TheMarkdownMediaSrc
      })
      //console.log(markdown)
      if(markdown != this.value) {
        this.syncForbid = 1
        this.$notify("change", markdown)
      }
    },
    //-----------------------------------------------
    quillSelectionChanged(range) {
      // Update selection info
      if(range) {
        // Indicate row:col
        let ii = [range.index]
        if(range.length > 0) {
          ii.push(range.length)
        }
        this.$notify("indicate", ii.join(":"))

        // Update format
        this.quillUpdateFormat(range)
      }
    },
    //-----------------------------------------------
    quillUpdateFormat(range) {
      let fmt = this.$editor.getFormat(range)
      //console.log(fmt)
      //fmt = _.cloneDeep(fmt)
      if(fmt.header) {
        fmt[`h${fmt.header}`] = true
      } else {
        fmt["h0"] = true
      }
      if(!_.isEqual(this.myToolbarStatus, fmt)) {
        this.myToolbarStatus = fmt
      }
    },
    //-----------------------------------------------
    installQuillEditor() {
      // Guard
      if(this.$editor) {
        return
      }
      //.............................................
      // Reset the Quill Default
      ResetQuillConfig(Quill)
      //Quill.register(MyIndent)
      //.............................................
      this.$editor = new Quill(this.$refs.stage, {
        modules: {
          syntax: false
        },
        bounds : this.$refs.stage,
        placeholder : Ti.I18n.text(this.placeholder)
      });
      //.............................................
      this.debounceQuillChanged = _.debounce((newDelta, oldDelta)=>{
        let delta = oldDelta.compose(newDelta)
        this.quillChanged(delta)
      }, 1000)
      //.............................................
      this.$editor.on("text-change", (newDelta, oldDelta, source)=>{
        //console.log("text-change",this.isNilContent, _.cloneDeep({newDelta, oldDelta}))
        if(!this.isNilContent) {
          this.debounceQuillChanged(newDelta, oldDelta)
        }
      })
      //.............................................
      this.$editor.on("selection-change", (range, oldRange, source)=>{
        this.quillSelectionChanged(range)
      })
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "value" : {
      handler : "syncMarkdown"
    },
    "isNilContent": function(newVal, oldVal){
      //console.log("isNilContent", newVal, oldVal)
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