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
    WallItemDisplay() {
      return {
        key : "..",
        // transformer : {
        //   name : "Wn.Util.getObjThumbInfo",
        //   args : [{
        //       status : this.myItemStatus,
        //       exposeHidden : this.myExposeHidden
        //     }]
        // },
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
    DataList() {
      if(this.myData) {
        if(_.isArray(this.myData)) {
          return this.myData
        }
        if(_.isArray(this.myData.list)) {
          return this.myData.list
        }
      }
      return []
    },
    //--------------------------------------------
    hasDataList() {
      return !_.isEmpty(this.DataList)
    },
    //--------------------------------------------
    WallDataList() {
      if(!this.hasDataList) {
        return []
      }
      let list = []
      for(let it of this.DataList) {
        if(!this.isHiddenItem(it)) {
          let li = Wn.Util.getObjThumbInfo(it, {
            status : this.myItemStatus,
            exposeHidden : this.myExposeHidden,
            titleKey : this.itemTitleKey,
            badges : this.itemBadges
          })
          list.push(li)
          //list.push(it)
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
    AcceptUploadFiles() {
      if(this.acceptUpload) {
        if(_.isString(this.acceptUpload)) {
          return this.acceptUpload
        }
        if(_.isArray(this.acceptUpload)) {
          return this.acceptUpload.join(",")
        }
      }
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
    },
    //--------------------------------------------
    UploadDragAndDropHandler() {
      if(this.droppable) {
        return this.OnDropFiles
      }
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
    OnItemSelecteItem({currentId, checkedIds, currentIndex}) {
      //console.log("OnSelected", currentId, checkedIds)
      // For Desktop
      this.myCurrentId  = currentId
      this.myCheckedIds = checkedIds

      let context = {
        current : this.getCurrentItem(),
        checked : this.getCheckedItems(),
        checkedIds, currentId, currentIndex,
      }

      // Notify the real objects
      this.$notify("select", context)

      return {stop:true}
    },
    //--------------------------------------------
    OnItemOpen() {
      let obj = this.getCurrentItem()
      if(obj) {
        this.$notify("open:wn:obj", obj)
      }
    },
    //--------------------------------------------
    async OnDropFiles(files) {
      // console.log("OnDropFiles", files)
      if(!this.droppable)
        return
      let fs = [...files]
      await this.doUpload(fs)
      
      // Wait the computed result and notify
      this.$nextTick(()=>{
        // Find my checked files
        let objs = []
        if(this.hasDataList){
          _.forEach(this.myData.list, it=>{
            if(this.myCheckedIds[it.id]){
              objs.push(it)
            }
          })
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
      if(this.myCurrentId && this.hasDataList) {
        return _.find(this.myData.list, it=>it.id == this.myCurrentId)
      }
    },
    //--------------------------------------------
    getCheckedItems() {
      if(this.hasDataList)
        return _.filter(this.myData.list, it=>this.myCheckedIds[it.id])
      return []
    },
    //--------------------------------------------
    setItem(newItem) {
      if(newItem && this.hasDataList) {
        let list = _.map(this.myData.list, it => {
          return it.id == newItem.id
            ? newItem
            : it
        })
        this.myData = _.assign({}, this.myData, {list})
      }
    },
    //--------------------------------------------
    setItemStatus(id, status="loading") {
      this.myItemStatus = _.assign({}, this.myItemStatus, {
        [id] : status
      })
    },
    //--------------------------------------------
    findRowById(rowId) {
      return this.$innerList.findRowById(rowId)
    },
    //--------------------------------------------
    getItemById(id) {
      let row = this.$innerList.findRowById(id)
      if(row) {
        return row.rawData
      }
    },
    //--------------------------------------------
    selectItem(id) {
      this.$innerList.selectRow(id)
    },
    //--------------------------------------------
    selectItemByIndex(index) {
      this.$innerList.selectRowByIndex(index)
    },
    //--------------------------------------------
    // For global menu invoke checkAll/cancleAll
    invokeList(methodName) {
      Ti.InvokeBy(this.$innerList, methodName)
    },
    //--------------------------------------------
    isHiddenItem(it) {
      if(it && it.nm && it.nm.startsWith(".") && !this.myExposeHidden) {
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
    // toggleExposeHidden() {
    //   let newVal = !this.myExposeHidden
    //   this.myExposeHidden = newVal
    //   if(this.keeyHiddenBy) {
    //     Ti.Storage.session.set(this.keeyHiddenBy, newVal)
    //   }
    // },
    //--------------------------------------------
    openLocalFileSelectdDialog(){
      this.$refs.file.click()
    },
    //--------------------------------------------
    async openCurrentMeta() {
      let meta = this.getCurrentItem() || this.meta

      if(!meta) {
        await Ti.Toast.Open("i18n:nil-obj")
        return
      }

      let reo = await Wn.EditObjMeta(meta, {fields:"auto"})
      
      // Update to current list
      if(reo) {
        let {updates, data} = reo
        // TODO if update the "thumb" may need to force reload the preview
        // Update to list
        this.setItem(data)

        return data
      }
    },
    //--------------------------------------------
    syncMyData() {
      //console.log("syncMyData")
      // 有时候直接改了 myData， 竟然会导致这个函数被触发
      // 我也是醉了，不知道为啥
      // 这会导致通过 setItem 修改列表，修改不了
      // 因为会被同步回来
      // 是否做一点脏脏的事情呢？
      //  - setItem 的时候做一个时间戳，在 500ms 内， 让 sync 不工作？
      this.myData = _.cloneDeep(this.data) || {
        list: [], pager: {}
      }
      this.myItemStatus = {}
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  watch: {
    // "myData" : function(newVal, oldVal) {
    //   console.log("MyData changed:", {
    //     "newVal" : _.get(newVal, "list.0.nm"),
    //     "oldVal" : _.get(oldVal, "list.0.nm"),
    //   })
    // },
    //--------------------------------------------
    "data" : {
      handler : "syncMyData",
      immediate : true
    },
    //--------------------------------------------
    "exposeHidden" : {
      handler : function(eh){
        this.myExposeHidden = eh
      },
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
    // if(this.keeyHiddenBy) {
    //   this.myExposeHidden = Ti.Storage.session.getBoolean(this.keeyHiddenBy)
    // }
  },
  //--------------------------------------------
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-list-adaptview-check-uploading")
  }
  //--------------------------------------------
  ////////////////////////////////////////////////
}
export default _M;