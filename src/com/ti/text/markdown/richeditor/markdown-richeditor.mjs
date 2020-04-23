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
const _M = {
  ///////////////////////////////////////////////////
  data: ()=>({
    myMeta : {},
    syncForbid : 0,
    myToolbarStatus : {}
  }),
  ///////////////////////////////////////////////////
  props : {
    //...............................................
    // Data
    //...............................................
    "mediaBase" : {
      type : String,
      default : undefined
    },
    "value" : {
      type : String,
      default : ""
    }, 
    //...............................................
    // Aspact
    //...............................................
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
        "Heading", "|", "B", "I", "|", "Link", "Code", 
        "|", "BlockQuote", "CodeBlock", 
        "|", "Outdent", "Indent",  
        "|", "UL", "OL",
        "|", "Media"
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
      return this.getTopClass()
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
    ToolbarMenuData() {
      let list = []
      _.forEach(this.toolbar, v => {
        let it = ({
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
          },
          //.........................................
          "Media" : {
            icon : "fas-photo-video",
            action : "$parent:OnInsertMedia"
          },
          //.........................................
        })[v]
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
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    // Events
    //-----------------------------------------------
    OnToolbarChange({name, value}={}) {
      console.log({name, value})
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
    async OnInsertMedia() {
      let list = await Wn.OpenObjSelector()

      // User cancel
      if(!list || _.isEmpty(list)) {
        return
      }
      
      for(let obj of list) {
        let home = Wn.Session.getHomePath();
        let rph = Ti.Util.getRelativePath(home, obj.ph, "")
        let aph = Ti.Util.appendPath("~", rph)
        let src = `/o/content?str=${aph}`
        // Video
        if(obj.mime && obj.mime.startsWith("video")) {
          this.insertMedia("video", src, {
            controls : false,
            autoplay : false
          })
        }
        // Image
        else {
          this.insertMedia("image", src)
        }
      }
    },
    //-----------------------------------------------
    // Insert Operation
    //-----------------------------------------------
    insertMedia(type="image", src, attrs={}) {
      // Guard
      if(!src) {
        return
      }

      // Prepare the Delta
      let Delta = Quill.import("delta")
      let det = new Delta()

      // Insert to current position
      let sel = this.$editor.getSelection()
      console.log("selection", sel)

      if(!sel) {
        this.$editor.setSelection(0)
        sel = {index:0, length:0}
      }

      let {index,length} = sel

      // Move to current
      det.retain(index)
            
      // Delete current
      if(length > 0) {
          det.delete(length)
      }

      // Add Media
      det.insert({[type]: src, attributes: attrs})
     
      // Update 
      this.$editor.updateContents(det)

      // Move cursor
      this.$editor.setSelection(index+1)
    },
    //-----------------------------------------------
    // Utility
    //-----------------------------------------------
    //-----------------------------------------------
    // Rendering
    //-----------------------------------------------
    // evalMediaSrc(src) {
    //   // Falsy src or base
    //   if(!src || !this.mediaBase) {
    //     return src
    //   }
    //   // Absolute path
    //   if(/^(https?:\/\/|\/)/i.test(src)) {
    //     return src
    //   }
    //   // Join the base
    //   return Ti.Util.appendPath(this.mediaBase, src)
    // },
    //-----------------------------------------------
    renderMarkdown() {
      console.log("!!!!!!!!!!!!!!!!!!!!!! renderMarkdown")
      if(!Ti.Util.isBlank(this.value)) {
        // Parse markdown
        let MdDoc = Cheap.parseMarkdown(this.value)
        console.log(MdDoc.toString())
        window.MdDoc = MdDoc
        this.myMeta = _.cloneDeep(MdDoc.getMeta())

        // Get delta
        let delta = MdDoc.toDelta()
        //console.log(JSON.stringify(delta, null, '   '))

        // Update Quill editor content
        this.$editor.setContents(delta);
        
      }
      // Show Blank
      else {
        this.myMeta = {}
      }
    },
    //-----------------------------------------------
    syncMarkdown() {
      if(this.syncForbid > 0) {
        this.syncForbid --
        return
      }
      this.renderMarkdown()
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
      MdDoc.setDefaultMeta(this.myMeta)
      this.myMeta = MdDoc.getMeta()
      console.log(MdDoc.toString())
      let markdown = MdDoc.toMarkdown()
      console.log(markdown)
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
        this.debounceQuillChanged(newDelta, oldDelta)
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
    }
  },
  ///////////////////////////////////////////////////
  mounted: function() {
    this.installQuillEditor()
    this.syncMarkdown()
  }
  ///////////////////////////////////////////////////
}
export default _M;