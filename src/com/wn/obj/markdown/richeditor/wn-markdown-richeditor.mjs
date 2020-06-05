const _M = {
  ///////////////////////////////////////////////////
  data: ()=>({
    myMeta: null
  }),
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    ToolbarActions() {
      return _.merge({
        "Media" : {
          icon : "fas-photo-video",
          action : ()=>this.OnInsertMedia()
        }
      },  this.actions)
    },
    //-----------------------------------------------
    isMyMetaMatchedProp() {
      if(!this.myMeta || !this.meta) {
        return false
      }
      if(_.isString(this.meta)) {
        // ID Path
        if(Wn.Io.isFullObjIdPath(this.meta)) {
          return this.myMeta.id == this.meta.substring(3)
        }
        // Path
        let nm0 = Ti.Util.getFileName(this.meta)
        return nm0 == this.myMeta.nm
      }
      // Object meta
      return this.meta.id == this.myMeta.id
    },
    //-----------------------------------------------
    TheValue() {
      // Wait myMeta reloaded
      if(!Ti.Util.isNil(this.value) 
         && this.meta 
         && !this.isMyMetaMatchedProp) {
        return null
      }
      return this.value
    },
    //-----------------------------------------------
    TheMarkdownMediaSrc() {
      if(this.markdownMediaSrc) {
        return this.markdownMediaSrc
      }
      return async src => {
        // special media 
        let m = /^\/o\/content\?str=id:(.+)$/.exec(src)
        if(m) {
          let obj = await Wn.Io.loadMetaById(m[1])
          if(obj) {
            return Wn.Io.formatObjPath(obj, this.mediaSrcMode, this.myMeta)
          }
        }
        return src
      }
    },
    //-----------------------------------------------
    ThePreviewMediaSrc() {
      if(this.previewMediaSrc) {
        return this.previewMediaSrc
      }
      return async src => {
        // Outsite link
        if(/^(https?:)(\/\/)/.test(src))
          return src

        console.log("preview", src)
        let obj = await Wn.Io.loadMetaBy(src, this.myMeta)
        if(obj) {
          return `/o/content?str=id:${obj.id}`
        }
        return src
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    OnEditorInit($editor) {
      this.$editor = $editor
    },
    //-----------------------------------------------
    async OnInsertMedia() {
      // Get the last open
      let last = this.myMeta || this.defaultMediaDir
      if(this.keepLastBy)
        last = Ti.Storage.local.getString(this.keepLastBy) || last

      // Open selector to pick list
      let list = await Wn.OpenObjSelector(last, {
        fallbackPath: this.defaultMediaDir
      })

      // User cancel
      if(!list || _.isEmpty(list)) {
        return
      }

      // Save the last open
      if(this.keepLastBy) {
        let oFir = _.first(list);
        let pph = Ti.Util.getParentPath(oFir.ph)
        let rph = Wn.Session.getFormedPath(pph)
        Ti.Storage.local.set(this.keepLastBy, rph);
      }
      
      // Batch insert
      for(let obj of list) {
        this.insertMediaObj(obj)
      }
    },
    //-----------------------------------------------
    // Insert Operation
    //-----------------------------------------------
    insertMediaObj(obj={}) {
      let mime = obj.mime

      // Guard
      if(!mime)
        return

      // Preview source
      let src = `/o/content?str=id:${obj.id}`

      // Video
      if(mime.startsWith("video/")) {
        this.insertMedia("video", src, {
          controls : false,
          autoplay : false
        })
      }
      // Image
      else if(mime.startsWith("image/")) {
        this.insertMedia("image", src)
      }
    },
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
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch: {
    "meta": {
      handler: async function(pathOrObj){
        if(_.isString(pathOrObj)) {
          this.myMeta = await Wn.Io.loadMetaBy(pathOrObj)
        } else {
          this.myMeta = pathOrObj
        }
      },
      immediate: true
    }
  }
  ///////////////////////////////////////////////////
}
export default _M;