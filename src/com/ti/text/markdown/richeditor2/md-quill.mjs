import {BrBlot} from "./blot/br.blot.mjs";

/////////////////////////////////////////////////////
async function ResetQuillConfig(Quill) {
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
  // New format
  // ...
  //let {BlotBr} = await import("./br-blot.mjs")
  console.log(BrBlot)
  //.................................................
  // Mark it
  Quill.__has_been_reset = true
}
/////////////////////////////////////////////////////
const _M = {
  ///////////////////////////////////////////////////
  data : ()=>({
    myDelta : []
  }),
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    // Quill
    //-----------------------------------------------
    async quillChanged(delta) {
      //console.log("changed", JSON.stringify(delta, null, '  '))
      //console.log("quillChanged")
      this.myDelta = delta
      // Guard
      if(this.isContentNil) {
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
      this.$editor = new Quill(this.$refs.editing, {
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
        //console.log("text-change",this.isContentNil, _.cloneDeep({newDelta, oldDelta}))
        if(!this.isContentNil) {
          this.debounceQuillChanged(newDelta, oldDelta)
        }
      })
      //.............................................
      this.$editor.on("selection-change", (range, oldRange, source)=>{
        this.quillSelectionChanged(range)
      })
    }
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////
}
export default _M;