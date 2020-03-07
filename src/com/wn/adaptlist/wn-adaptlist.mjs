export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////
  data: ()=>({
    myCurrentId  : null,
    myCheckedIds : {},
    myUploadigFiles : [],
    myItemStatus : {}
  }),
  ////////////////////////////////////////////////
  props : {
    "itemClassName" : {
      type : String,
      default : null
    },
    "meta" : {
      type : Object,
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
    // "currentId" : {
    //   type : String,
    //   default : null
    // },
    // "checkedIds" : {
    //   type : Array,
    //   default : ()=>[]
    // },
    // "uploadings" : {
    //   type : Array,
    //   default : ()=>[]
    // },
    "pager" : {
      type : Object,
      default : null
    },
    "status" : {
      type : Object,
      default : ()=>({
        "reloading" : false,
        //"deleting" : false,
        //"exposeHidden" : false,
        //"renaming" : false
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
    "keeyHiddenBy" : {
      type : String,
      default : "wn-list-adaptview-expose-hidden"
    },
    "routers" : {
      type : Object,
      default : ()=>({
        "reload"     : "dispatch:main/reload",
        "updateItem" : "commit:main/updateItem",
        "setExposeHidden" : "commit:main/setExposeHidden"
      })
    }
  },
  ////////////////////////////////////////////////
  computed : {
    //--------------------------------------------
    // Auto PageMode
    // ...Vuex.mapGetters("main", [
    //   "currentItem", 
    //   "currentItemId", 
    //   "selectedItems"]),
    //--------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-self-actived" : this.isSelfActived,
        "is-actived"     : this.isActived
      }, this.className)
    },
    //--------------------------------------------
    theExtendFunctionSet() {
      return Wn.Util;
    },
    //--------------------------------------------
    theWallItemDisplay() {
      return {
        key : "..",
        transformer : {
          name : "getObjThumbInfo",
          args : [{
            status : this.myItemStatus,
            exposeHidden : this.status.exposeHidden
          }]
        },
        comType : 'ti-obj-thumb',
        comConf : {
          "..." : "${=value}"
        }
      }
    },
    //--------------------------------------------
    theUploadingItemDisplay() {
      return {
        key : "..",
        comType : 'ti-obj-thumb',
        comConf : {
          "..." : "${=value}"
        }
      }
    },
    //--------------------------------------------
    theList() {
      return _.filter(this.list, it=>!this.isHiddenItem(it))
    },
    //--------------------------------------------
    /***
     * Show uploading list
     */
    theUploadingList() {
      let list = this.myUploadigFiles
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
    //--------------------------------------------
    /***
     * has uploading
     */
    hasUploading() {
      return this.myUploadigFiles.length > 0
    },
    //--------------------------------------------
    theUploadingClass() {
      return this.hasUploading ? "up-show" : "up-hide"
    },
    //--------------------------------------------
    // onListReady() {
    //   return ($list)=>{
    //     this.$innerList = $list
    //   }
    // }
    //--------------------------------------------
  },  // ~ computed
  ////////////////////////////////////////////////
  methods : {
    //--------------------------------------------
    getCurrentItem() {
      if(this.myCurrentId) {
        return _.find(this.list, it=>it.id == this.myCurrentId)
      }
    },
    //--------------------------------------------
    getCheckedItems() {
      return _.filter(this.list, it=>this.myCheckedIds[it.id])
    },
    //--------------------------------------------
    setItemStatus(id, status="loading") {
      this.myItemStatus = _.assign({}, this.myItemStatus, {
        [id] : status
      })
    },
    //--------------------------------------------
    // invokeList(methodName) {
    //   Ti.InvokeBy(this.$innerList, methodName)
    // },
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
    onSelected({current, checked, currentId, checkedIds, currentIndex}) {
      //console.log("onSelected", currentIndex, current)
      // For Desktop
      this.myCurrentId  = currentId
      this.myCheckedIds = checkedIds

      this.$emit("select", {
        current, currentId, currentIndex,
        checked, checkedIds
      })
    },
    //--------------------------------------------
    onOpen(current) {
      //console.log("onOpen")
      this.$emit("open", current)
    },
    //--------------------------------------------
    toggleExposeHidden() {
      let newVal = !this.status.exposeHidden
      this._run("setExposeHidden", newVal)
      if(this.keeyHiddenBy) {
        Ti.Storage.session.set(this.keeyHiddenBy, newVal)
      }
    },
    //--------------------------------------------
    async doDownload() {
      let list = this.getCheckedItems()
      if(_.isEmpty(list)) {
        return await Ti.Toast.Open('i18n:wn-download-none', "warn")
      }
      // Too many, confirm at first
      if(list.length > 5) {
        if(!await Ti.Confirm({
          text : "i18n:wn-download-too-many",
          vars : {N:list.length}})) {
          return
        }
      }
      // Do the download
      for(let it of list) {
        if('FILE' != it.race) {
          if(!await Ti.Confirm({
              text : "i18n:wn-download-dir",
              vars : it
            }, {
              textYes : "i18n:continue",
              textNo  : "i18n:terminate"
            })){
            return
          }
          continue;
        }
        let link = Wn.Util.getDownloadLink(it)
        Ti.Be.OpenLink(link)
      }
    },
    //--------------------------------------------
    async doRename() {
      let it = this.getCurrentItem()
      if(!it) {
        return await Ti.Toast.Open('i18n:wn-rename-none', "warn")
      }
      this.setItemStatus(it.id, "renaming")
      try {
        // Get newName from User input
        let newName = await Ti.Prompt({
            text : 'i18n:wn-rename',
            vars : {name:it.nm}
          }, {
            title : "i18n:rename",
            placeholder : it.nm,
            value : it.nm
          })
        // Check the newName
        if(newName) {
          // Check the newName contains the invalid char
          if(newName.search(/[%;:"'*?`\t^<>\/\\]/)>=0) {
            return await Ti.Alert('i18n:wn-rename-invalid')
          }
          // Check the newName length
          if(newName.length > 256) {
            return await Ti.Alert('i18n:wn-rename-too-long')
          }
          // Check the suffix Name
          let oldSuffix = Ti.Util.getSuffix(it.nm)
          let newSuffix = Ti.Util.getSuffix(newName)
          if(oldSuffix && oldSuffix != newSuffix) {
            let repair = await Ti.Confirm("i18n:wn-rename-suffix-changed")
            if(repair) {
              newName += oldSuffix
            }
          }
          // Mark renaming
          this.setItemStatus(it.id, "loading")
          // Do the rename
          let newMeta = await Wn.Sys.exec2(
              `obj id:${it.id} -cqno -u 'nm:"${newName}"'`,
              {as:"json"})
          // Error
          if(newMeta instanceof Error) {
            //commit("$toast", {text:"i18n:wn-rename-fail", type:"error"})
            Ti.Toast.Open("i18n:wn-rename-fail", "error")
            commit("updateItemStatus", 
              {id:it.id, status:{loading:false}})
          }
          // Replace the data
          else {
            Ti.Toast.Open("i18n:wn-rename-ok", "success")
            this._run("updateItem", newMeta)
          }
        }  // ~ if(newName)
      }
      // reset the status
      finally {
        this.setItemStatus(it.id, null)
      }
    },
    //--------------------------------------------
    async doDelete() {
      let list = this.getCheckedItems()
      // Guard
      if(_.isEmpty(list)) {
        return await Ti.Toast.Open('i18n:wn-del-none', "warn")
      }

      let delCount = 0
      // make removed files. it remove a video
      // it will auto-remove the `videoc_dir` in serverside also
      // so, in order to avoid delete the no-exists file, I should
      // remove the `videoc_dir` ID here, each time loop, check current
      // match the id set or not, then I will get peace
      let exRemovedIds = {}
      try {
        // Loop items
        for(let it of list) {
          // Duck check
          if(!it || !it.id || !it.nm)
            continue
          // Ignore obsolete item
          if(it.__is && (it.__is.loading || it.__is.removed))
            continue
          // Ignore the exRemovedIds
          if(exRemovedIds[it.id])
            continue
          
          // Mark item is processing
          this.setItemStatus(it.id, "loading")
          // If DIR, check it is empty or not
          if('DIR' == it.race) {
            let count = await Wn.Sys.exec(`count -A id:${it.id}`)
            count = parseInt(count)
            if(count > 0) {
              // If user confirmed, then rm it recurently
              if(!(await Ti.Confirm({
                  text:'i18n:wn-del-no-empty-folder', vars:{nm:it.nm}}))) {
                this.setItemStatus(it.id, null)
                continue
              }
            }
          }
          // Do delete
          // TODO 等增加了全局的 Log 模块，就搞一下这个
          // commit("$log", {
          //   text:"i18n:wn-del-item", vars:{name:it.nm}
          // })
          await Wn.Sys.exec(`rm ${'DIR'==it.race?"-r":""} id:${it.id}`)
          // Mark item removed
          this.setItemStatus(it.id, "removed")
          // If video result folder, mark it at same time
          let m = /^id:(.+)$/.exec(it.videoc_dir)
          if(m) {
            let vdId = m[1]
            exRemovedIds[vdId] = true
            this.setItemStatus(vdId, "removed")
          }
          // Counting
          delCount++
          // Then continue the loop .......^
        }
        // Do reload
        await this._run("reload")
      }
      // End deleting
      finally {
        Ti.Toast.Open("i18n:wn-del-ok", {N:delCount}, "success")
      }

    },
    //--------------------------------------------
    async doUpload(files=[]) {
      // Prepare the list
      let ups = _.map(files, (file, index)=>({
        id : `U${index}_${Ti.Random.str(6)}`,
        file : file,
        total : file.size,
        current : 0
      }))

      // Show Uploading
      this.myUploadigFiles = ups

      // Prepare the list
      let newIds = {}
      // Do upload file one by one
      for(let up of ups) {
        let file = up.file
        let {ok, data} = await Wn.Io.uploadFile(file, {
          target : `id:${this.meta.id}`,
          progress : function(pe){
            up.current = pe.loaded
          }
        })
        if(ok) {
          newIds[data.id] = true
        }
      }

      // All done, hide upload
      _.delay(()=>{
        this.myUploadigFiles = []
      }, 1000)

      // Call reload
      await this._run("reload")
      

      // Make it checked
      this.myCheckedIds = newIds
      this.myCurrentId = null
    },
    //--------------------------------------------
    async onDropFiles(files) {
      if(!this.droppable)
        return
      let fs = [...files]
      let reo = await this.doUpload(fs)
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
    },
    //--------------------------------------------
    async onOpenProperties() {
      let meta = this.getCurrentItem() || this.meta

      if(!meta) {
        return Ti.Toast.Open("i18n:nil-obj")
      }

      Wn.EditObjMeta(meta)
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  watch: {
    //--------------------------------------------
    "hasUploading" : function(newVal, oldVal) {
      if(true===oldVal && false===newVal) {
        Ti.Toast.Open("i18n:upload-done", "success")
      }
    }
    //--------------------------------------------
    // "uploadDialog" : function() {
    //   //console.log("uploadDialog", this.uploadDialog)
    //   if(this.uploadDialog) {
    //     this.openLocalFileSelectdDialog()
    //   }
    // }
    //--------------------------------------------
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
        Ti.Toast.Open("i18n:upload-nofinished", "warn")
      }
    })
    // Restore the exposeHidden
    if(this.keeyHiddenBy) {
      let eh = Ti.Storage.session.getBoolean(this.keeyHiddenBy)
      this._run("setExposeHidden", eh)
    }
  },
  //--------------------------------------------
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-list-adaptview-check-uploading")
  }
  //--------------------------------------------
  ////////////////////////////////////////////////
}