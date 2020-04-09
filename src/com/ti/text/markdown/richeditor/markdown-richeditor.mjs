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
    "content" : {
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
            action : "$parent:setSelectionAsBold",
            disableBy : "bold"
          },
          //.........................................
          "I" : {
            icon : "fas-italic",
            action : "$parent:setSelectionAsItalic",
            disableBy : "italic"
          },
          //.........................................
          "Link" : {
            icon : "fas-link",
            action : "$parent:setSelectionAsLink",
            disableBy : "link"
          },
          //.........................................
          "Code" : {
            icon : "zmdi-code",
            action : "$parent:setSelectionAsCode",
            disableBy : "code"
          },
          //.........................................
          "Heading" : {
            type : "group",
            icon : "fas-hashtag",
            text : "i18n:wordp-heading",
            items : [{
                text: "i18n:wordp-h1",
                action : "$parent:setSelectionAsHeading(1)",
                disableBy : "h1"
              }, {
                text: "i18n:wordp-h2",
                action : "$parent:setSelectionAsHeading(2)",
                disableBy : "h2"
              }, {
                text: "i18n:wordp-h3",
                action : "$parent:setSelectionAsHeading(3)",
                disableBy : "h3"
              }, {
                text: "i18n:wordp-h4",
                action : "$parent:setSelectionAsHeading(4)",
                disableBy : "h4"
              }, {
                text: "i18n:wordp-h5",
                action : "$parent:setSelectionAsHeading(5)",
                disableBy : "h5"
              }, {
                text: "i18n:wordp-h6",
                action : "$parent:setSelectionAsHeading(6)",
                disableBy : "h6"
              }, {
                text: "i18n:wordp-h0",
                action : "$parent:setSelectionAsHeading(0)"
              }]
          },
          //.........................................
          "BlockQuote" : {
            icon : "fas-quote-right",
            action : "$parent:setSelectionAsBlockQuote",
            statusKey : "blockquote",
            altDisplay : {
              capture : false,
              icon : "fas-quote-left",
            }
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
    // Events
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
      if(!Ti.Util.isBlank(this.content)) {
        // Parse markdown
        let MdDoc = Cheap.parseMarkdown(this.content)
        console.log(MdDoc.toString())
        window.MdDoc = MdDoc
        this.myMeta = _.cloneDeep(MdDoc.getMeta())

        // Get delta
        let delta = MdDoc.toDelta()
        console.log(JSON.stringify(delta, null, '   '))

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
      //console.log("changed", JSON.stringify(delta, null, '  '))
      let MdDoc = Cheap.parseDelta(delta)
      MdDoc.setDefaultMeta(this.myMeta)
      this.myMeta = MdDoc.getMeta()
      //console.log(MdDoc.toString())
      let markdown = MdDoc.toMarkdown()
      //console.log(markdown)
      if(markdown != this.content) {
        this.syncForbid = 1
        this.$notify("change", markdown)
      }
    },
    //-----------------------------------------------
    quillSelectionChanged() {
      // Update selection info
      let sel = this.$editor.getSelection()
      if(sel) {
        let ii = [sel.index]
        if(sel.length > 0) {
          ii.push(sel.length)
        }
        this.$notify("indicate", ii.join(":"))
      }

      // Update format
      let fmt = this.$editor.getFormat()
        fmt = _.cloneDeep(fmt)
        if(fmt.header) {
          fmt[`h${fmt.header}`] = true
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
          // toolbar: [
          //   [{ header: [1, 2, false] }],
          //   ['bold', 'italic', 'underline'],
          //   ['image', 'code-block'],
          //   [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          //   [{ 'indent': '-1'}, { 'indent': '+1' }],
          // ]
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
        this.quillSelectionChanged()
      })
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "content" : {
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