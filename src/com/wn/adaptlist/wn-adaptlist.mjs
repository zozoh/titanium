const _M = {
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
      let list = []
      for(let it of this.myData.list) {
        if(!this.isHiddenItem(it)) {
          let status = this.myItemStatus[it.id]
          list.push(_.assign({$wn$adaptlist$status:status}, it))
        }
      }
      return list
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
    OnListInit($list){this.$innerList = $list},
    //--------------------------------------------
    // Events
    //--------------------------------------------
    OnSelected({currentId, checkedIds}) {
      //console.log("OnSelected", currentId, checkedIds)
      // For Desktop
      this.myCurrentId  = currentId
      this.myCheckedIds = checkedIds

      return {stop:false}
    },
    //--------------------------------------------
    async OnDropFiles(files) {
      if(!this.droppable)
        return
      let fs = [...files]
      await this.doUpload(fs)
      
      // Wait the computed result and notify
      this.$nextTick(()=>{
        // Find my checked files
        let objs = []
        for(let it of this.TheDataList){
          if(this.myCheckedIds[it.id]){
            objs.push(it)
          }
        }

        // Emit events
        this.$notify("uploaded", objs)
      })
    },
    //--------------------------------------------
    async OnSelectLocalFilesToUpload(evt){
      await this.OnDropFiles(evt.target.files)
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
    // For global menu invoke checkAll/cancleAll
    invokeList(methodName) {
      console.log("methodName")
      Ti.InvokeBy(this.$innerList, methodName)
    },
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
      // Run by customized function
      if(_.isFunction(target)) {
        await target()
      }
      // In app
      else if(target) {
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

      let reo = await Wn.EditObjMeta(meta)
      
      // Update to current list
      if(reo) {
        let {updates, data} = reo
        // TODO if update the "thumb" may need to force reload the preview
        // Update to list
        this.setItem(data)
      }
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
    "data" : {
      handler : "syncMyData",
      immediate : true
    },
    //--------------------------------------------
    "myExposeHidden" : function(eh){
      this.$notify("expose-hidden", eh)
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