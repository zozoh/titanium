const _M = {
  ///////////////////////////////////////////
  inject: ["$ThingManager"],
  ///////////////////////////////////////////
  data: ()=>({
    myDataDirObj: null,
    myData: {},
    myStatus: {
      reloading: false
    },
    myCurrentId: null
  }),
  ///////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    hasDataHome() {
      return this.dataHome ? true : false
    },
    //--------------------------------------
    CurrentFile(){
      if(this.myCurrentId && this.myData.list){
        for(let it of this.myData.list) {
          if(this.myCurrentId == it.id){
            return it
          }
        }
      }
    },
    //--------------------------------------
    ThePreview() {
      let preview = Ti.Util.getFallback(this.preview, this.dirName, "@default") 
                    || this.preview 
                    || {}

      return {
        showInfo  : false,
        floatInfo : false,
        infoPosition  : "left",
        infoNameWidth : 40,
        infoValueWidth : 120,
        stateLocalKey : this.getStateLocalKey("preview"),
        // Customized
        ...preview,
        // Edit Info 
        editInfoBy : ()=>{
          this.editPreviewInfo()
        }
      }
    },
    //--------------------------------------
    TheFiles() {
      return _.assign({}, this.files, {
        routers : {
          "reload" : async ()=>{
            await this.reloadData()
          }
        }
      })
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnAdaptListInit($adaptlist){this.$adaptlist = $adaptlist},
    //--------------------------------------
    // Events
    //--------------------------------------
    OnDirNameChanged(dirName) {
      Ti.App(this).commit("main/setCurrentDataDir", dirName)
      
      this.$nextTick(()=>{
        this.reloadData()
      })
    },
    //--------------------------------------
    OnFileSelect({currentId}) {
      this.myCurrentId = currentId
    },
    //--------------------------------------
    OnFileOpen(obj) {
      console.log("haha", obj)
      this.$notify("file:open", obj)
    },
    //--------------------------------------
    async OnFileUploaded(files=[]){
      let f = _.first(files)
      if(f) {
        this.$adaptlist.myCurrentId = f.id
        this.myCurrentId = f.id
      }
      await Ti.App(this).dispatch("main/autoSyncCurrentFilesCount")
    },
    //--------------------------------------
    // Untility
    //--------------------------------------
    getStateLocalKey(name) {
      if(this.stateLocalKey && name) {
        return  `${this.stateLocalKey}_${name}`
      }
    },
    //--------------------------------------
    async doDeleteSelected(){
      await this.$adaptlist.doDelete()
      await Ti.App(this).dispatch("main/autoSyncCurrentFilesCount")
    },
    //--------------------------------------
    async checkDataDir() {
      // Guard
      if(!this.hasDataHome) {
        return
      }
      // If empty data home, create one
      if(!this.myDataDirObj) {
        let pos = this.dataHome.indexOf('/')
        let tsDataPh = this.dataHome.substring(0, pos)
        let dirPath = Ti.Util.appendPath(this.dataHome.substring(pos+1), this.dirName)
        let newMeta = {
          race : "DIR",
          nm   : dirPath
        }
        let json = JSON.stringify(newMeta)
        let cmdText = `obj "${tsDataPh}" -IfNoExists -new '${json}' -cqno`
        //console.log(cmdText)
        let dataDirObj = await Wn.Sys.exec2(cmdText, {as:"json"})
        let dataHomeObj = await Wn.Io.loadMetaBy(this.dataHome)

        // Update local state
        Ti.App(this).commit("main/setCurrentDataHomeObj", dataHomeObj)
        this.myDataDirObj = dataDirObj
      }
    },
    //--------------------------------------
    async doUploadFiles() {
      // Guard
      await this.checkDataDir()
      
      // Do upload
      if(this.myDataDirObj) {
        this.$adaptlist.openLocalFileSelectdDialog()
      }
      // Impossible
      else {
        throw "Impossible!!!"
      }
    },
    //--------------------------------------
    async editPreviewInfo() {
      //console.log("showPreviewObjInfo:", this.preview)
      if(this.CurrentFile) {
        let options = _.get(this.previewEdit, this.dirName)
        let reo = await Wn.EditObjMeta(this.CurrentFile, options)
        if(reo && reo.data) {
          this.updateItemInDataList(reo.data)
        }
      }
    },
    //--------------------------------------
    updateItemInDataList(meta) {
      if(meta && this.myData && _.isArray(this.myData.list)) {
        this.myData.list = _.map(
          this.myData.list,
          it => it.id == meta.id ? meta : it)
      }
    },
    //--------------------------------------
    // Reloading
    //--------------------------------------
    async reloadData() {
      if(this.dataHome && this.dirName) {
        this.myStatus.reloading = true
        let hmph = Ti.Util.appendPath(this.dataHome, this.dirName)
        //console.log("reloadData:", hmph)
        let home = await Wn.Io.loadMeta(hmph)
        // Guard
        if(!home) {
          this.myDataDirObj = null
          this.myData = {}
        }
        // Update data
        else {
          let reo = await Wn.Io.loadChildren(home)
          this.myDataDirObj = home
          this.myData = reo
        }
        _.delay(()=>{
          this.myStatus.reloading = false
        }, 100)
      }
      // Reset
      else {
        this.myDataDirObj = null
        this.myData = {}
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  watch : {
    "dirName" : {
      handler : "reloadData",
      immediate : true
    },
    "dataHome" : {
      handler : "reloadData",
      immediate : true
    }
  },
  ///////////////////////////////////////////
  mounted : function() {
    this.$ThingManager.$files = this
  }
  ///////////////////////////////////////////
}
export default _M