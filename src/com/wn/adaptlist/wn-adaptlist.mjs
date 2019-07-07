export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "itemClassName" : {
      type : String,
      default : null
    },
    "list" : {
      type : Array,
      default : ()=>[]
    },
    "changedId" : {
      type : String,
      default : null
    },
    "currentId" : {
      type : String,
      default : null
    },
    "checkedIds" : {
      type : Array,
      default : ()=>[]
    },
    "uploadings" : {
      type : Array,
      default : ()=>[]
    },
    "pager" : {
      type : Object,
      default : null
    },
    "status" : {
      type : Object,
      default : ()=>({
        "reloading" : false,
        "deleting" : false,
        "exposeHidden" : false,
        "renaming" : false
      })
    },
    // Drop files to upload
    "droppable" : {
      type : Boolean,
      default : true
    },
    // multi-selectable
    // effected when selectable is true
    "multi" : {
      type : Boolean,
      default : true
    },
    "checkable" : {
      type : Boolean,
      default : true
    },
    "blurable" : {
      type : Boolean,
      default : true
    },
    "selectable" : {
      type : Boolean,
      default : true
    },
    // aspect: list item spacing
    // `xs|sm|md|lg|xl`
    "spacing" : {
      type : String,
      default : "sm"
    },
    "routers" : {
      type : Object,
      default : ()=>({
        "recoverExposeHidden" : "commit:main/recoverExposeHidden",
        "setCurrentId"        : "commit:main/setCurrentId",
        "setCheckedIds"       : "commit:main/setCheckedIds",
        "selectItem"          : "commit:main/selectItem",
        "blurAll"             : "commit:main/blurAll",
        "upload"              : "dispatch:main/upload"
      })
    }
  },
  ////////////////////////////////////////////////
  computed : {
    /***
     * Show uploading list
     */
    uploadingList() {
      let vm = this
      let list = vm.uploadings
      let re = []
      if(_.isArray(list)) {
        for(let it of list) {
          // Gen Preview for local image
          let mime = it.file.type
          let tp = Ti.Util.getSuffixName(it.file.name)
          let preview;
          if(/^image\//.test(mime)) {
            preview = {
              type : "localFile",
              value : it.file
            }
          } else {
            preview = Ti.Icons.get({tp, mime})
          }
          // Join to result list
          re.push({
            id    : it.id,
            title : it.file.name,
            preview,
            progress : (it.current/it.total)
          })
        }
      }
      return re
    },
    /***
     * has uploading
     */
    hasUploading() {
      return this.uploadingList.length > 0
    },
    uploadingClass() {
      return this.hasUploading ? "up-show" : "up-hide"
    }
  },  // ~ computed
  ////////////////////////////////////////////////
  watch: {
    //--------------------------------------------
    "hasUploading" : function(newVal, oldVal) {
      if(true===oldVal && false===newVal) {
        this.$message({
          showClose: true,
          message: Ti.I18n.get("upload-done"),
          duration : 3000,
          type: 'success'
        });
      }
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  methods : {
    //--------------------------------------------
    getFormedItem(it) {
      // Check the visibility
      let visibility = "show"
      if(it.nm.startsWith(".")) {
        if(this.status.exposeHidden) {
          visibility = "weak"
        } else {
          visibility = "hide"
        }
      }
      // Generate new Thumb Item
      return {
        id    : it.id,
        title : Wn.Util.getObjDisplayName(it),
        preview : Wn.Util.genPreviewObj(it),
        visibility,
        ...(it.__is || {
          loading  : false,
          removed  : false,
          progress : -1
        }),
        icons : it.__icons || {
          NW : null,
          NE : null,
          SW : null,
          SE : null
        }
      }
    },
    //--------------------------------------------
    isHiddenItem(it) {
      if(it.nm.startsWith(".") && !this.status.exposeHidden) {
        return true
      }
      return false
    },
    //--------------------------------------------
    async _run(nm, payload) {
      let target = (this.routers||{})[nm]
      if(target) {
        let app = Ti.App(this)
        return await app.exec(target, payload)
      }
    },
    //--------------------------------------------
    onSelected({current, selected}) {
      let cid = current ? current.id : null
      this._run("setCurrentId", cid)

      if(_.isArray(selected)) {
        let ids = []
        for(let it of selected) {
          ids.push(it.id)
        }
        this._run("setCheckedIds", ids)
      }
    },
    //--------------------------------------------
    onOpen({current}) {
      this.$emit("open", current)
    },
    // //--------------------------------------------
    // onItemSelected({mode,id,index}={}) {
    //   // Desktop mode, select items
    //   if(this.isViewportModeDesktop) {
    //     this._run("selectItem", {index, id, mode})
    //   }
    //   // Else just open it
    //   else {
    //     let meta = _.nth(this.list, index)
    //     if(meta) {
    //       this.$emit("open", meta)
    //     }  
    //   }
    // },
    // //--------------------------------------------
    // onItemOpen({id,index}={}) {
    //   let meta = _.nth(this.list, index)
    //   if(meta) {
    //     this.$emit("open", meta)
    //   }
    // },
    // //--------------------------------------------
    // onItemBlur() {
    //   this._run("blurAll")
    // },
    //--------------------------------------------
    async onDropFiles(files) {
      if(!this.droppable)
        return
      let fs = [...files]
      let reo = await this._run("upload", fs)
      // Emit events
      this.$emit("uploaded", reo)
    },
    //--------------------------------------------
    openLocalFileSelectdDialog(){
      this.$refs.file.click()
    },
    //--------------------------------------------
    async onSelectLocalFilesToUpload(evt){
      await this.onDropFiles(evt.target.files)
      this.$refs.file.value = ""
    }
  },
  ////////////////////////////////////////////////
  mounted : function(){
    //--------------------------------------------
    // Guart the uploading
    Ti.Fuse.getOrCreate().add({
      key : "wn-list-adaptview-check-uploading",
      everythingOk : ()=>{
        return !this.hasUploading
      },
      fail : ()=>{
        this.$message({
          showClose: true,
          message: Ti.I18n.get("upload-nofinished"),
          duration : 3000,
          type: 'warning'
        });
      }
    })
    // Restore the exposeHidden
    this._run("recoverExposeHidden")
  },
  //--------------------------------------------
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-list-adaptview-check-uploading")
  }
  //--------------------------------------------
  ////////////////////////////////////////////////
}