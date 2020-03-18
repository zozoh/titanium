const _M = {
  ////////////////////////////////////////////////
  provide : function() {
    return {
      "$EmitBy" : (name, ...args)=>{
        if("select" == name) {
          this.OnSelected(...args)
        } else {
          this.$notify(name, ...args)
        }
      }
    }
  },
  ////////////////////////////////////////////////
  data: ()=>({
    myCurrentId  : null,
    myCheckedIds : {},
    myUploadigFiles : [],
    myItemStatus : {},
    myExposeHidden : true,
    myData : null
  }),
  ////////////////////////////////////////////////
  computed : {
    //--------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------------
    isReloading() {
      return _.get(this.status, "reloading")
    },
    //--------------------------------------------
    ExtendFunctionSet() {
      return Wn.Util;
    },
    //--------------------------------------------
    WallItemDisplay() {
      return {
        key : "..",
        transformer : {
          name : "getObjThumbInfo",
          args : [{
            status : this.myItemStatus,
            exposeHidden : this.myExposeHidden
          }]
        },
        comType : 'ti-obj-thumb',
        comConf : {
          "..." : "${=value}"
        }
      }
    },
    //--------------------------------------------
    UploadingItemDisplay() {
      return {
        key : "..",
        comType : 'ti-obj-thumb',
        comConf : {
          "..." : "${=value}"
        }
      }
    },
    //--------------------------------------------
    hasDataList() {
      return this.myData && _.isArray(this.myData.list)
    },
    //--------------------------------------------
    TheDataList() {
      if(!this.myData || _.isEmpty(this.myData.list)) {
        return []
      }
      return _.filter(this.myData.list, it=>!this.isHiddenItem(it))
    },
    //--------------------------------------------
    /***
     * Show uploading list
     */
    TheUploadingList() {
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
    UploadingClass() {
      return this.hasUploading ? "up-show" : "up-hide"
    }
    //--------------------------------------------
  },  // ~ computed
  ////////////////////////////////////////////////
  methods : {
    //--------------------------------------------
    // Events
    //--------------------------------------------
    OnSelected({current, checked, currentId, checkedIds, currentIndex}) {
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
    async OnDropFiles(files) {
      if(!this.droppable)
        return
      let fs = [...files]
      let reo = await this.doUpload(fs)
      // Emit events
      this.$emit("uploaded", reo)
    },
    //--------------------------------------------
    async OnSelectLocalFilesToUpload(evt){
      await this.onDropFiles(evt.target.files)
      this.$refs.file.value = ""
    },
    //--------------------------------------------
    // Getters
    //--------------------------------------------
    getCurrentItem() {
      if(this.myCurrentId) {
        return _.find(this.TheDataList, it=>it.id == this.myCurrentId)
      }
    },
    //--------------------------------------------
    getCheckedItems() {
      return _.filter(this.TheDataList, it=>this.myCheckedIds[it.id])
    },
    //--------------------------------------------
    setItem(newItem) {
      if(newItem && this.hasDataList) {
        let list = _.map(this.TheDataList, it => {
          return it.id == newItem.id
            ? newItem
            : it
        })
        this.myData.list = list
      }
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
      if(it.nm.startsWith(".") && !this.myExposeHidden) {
        return true
      }
      return false
    },
    //--------------------------------------------
    // Utility
    //--------------------------------------------
    async _run(nm, payload) {
      let target = (this.routers||{})[nm]
      if(target) {
        let app = Ti.App(this)
        return await app.exec(target, payload)
      }
    },
    //--------------------------------------------
    toggleExposeHidden() {
      let newVal = !this.myExposeHidden
      this.myExposeHidden = newVal
      if(this.keeyHiddenBy) {
        Ti.Storage.session.set(this.keeyHiddenBy, newVal)
      }
    },
    //--------------------------------------------
    openLocalFileSelectdDialog(){
      this.$refs.file.click()
    },
    //--------------------------------------------
    async openCurrentMeta() {
      let meta = this.getCurrentItem() || this.meta

      if(!meta) {
        return Ti.Toast.Open("i18n:nil-obj")
      }

      Wn.EditObjMeta(meta)
    },
    //--------------------------------------------
    syncMyData() {
      this.myData = _.cloneDeep(this.data) || {
        list: [], pager: {}
      }
      this.myItemStatus = {}
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
    },
    "data" : {
      handler : "syncMyData",
      immediate : true
    }
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
      this.myExposeHidden = Ti.Storage.session.getBoolean(this.keeyHiddenBy)
    }
  },
  //--------------------------------------------
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-list-adaptview-check-uploading")
  }
  //--------------------------------------------
  ////////////////////////////////////////////////
}
export default _M;