const _M = {
  ///////////////////////////////////////////
  provide : {
    primaryNotify: true
  },
  ///////////////////////////////////////////
  data: ()=>({
    myHome: null,
    myData: {},
    myStatus: {
      reloading: false
    },
    myCurrentId: null
  }),
  ///////////////////////////////////////////
  computed : {
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
      let preview = Ti.Util.getFallback(
        this.preview, 
        this.dirName, 
        "@default") || this.preview || {}

      return {
        showInfo  : false,
        floatInfo : false,
        infoPosition  : "left",
        infoNameWidth : 40,
        infoValueWidth : 120,
        stateLocalKey : this.stateLocalKey,
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
    OnAdaptListInit($adaptList){this.$adaptList = $adaptList},
    //--------------------------------------
    // Events
    //--------------------------------------
    OnDirNameChanged(dirName) {
      let app = Ti.App(this)
      app.commit("main/setCurrentDataDir", dirName)
      this.$nextTick(()=>{
        this.reloadData()
      })
    },
    //--------------------------------------
    OnFileSelected({currentId}) {
      this.myCurrentId = currentId
    },
    //--------------------------------------
    OnFileUploaded(files=[]){
      let f = _.first(files)
      if(f) {
        this.$adaptList.myCurrentId = f.id
        this.myCurrentId = f.id
      }
    },
    //--------------------------------------
    // Untility
    //--------------------------------------
    async doDeleteSelected(){
      await this.$adaptList.doDelete()
    },
    //--------------------------------------
    async doUploadFiles() {
      // Guard
      if(!this.hasDataHome) {
        return
      }
      // If empty data home, create one
      if(!this.myHome) {
        let pos = this.dataHome.indexOf('/')
        let tsDataPh = this.dataHome.substring(0, pos)
        let dirPath = Ti.Util.appendPath(this.dataHome.substring(pos+1), this.dirName)
        let newMeta = {
          race : "DIR",
          nm   : dirPath
        }
        let json = JSON.stringify(newMeta)
        let cmdText = `obj "${tsDataPh}" -IfNoExists -new '${json}' -cqno`
        console.log(cmdText)
        this.myHome = await Wn.Sys.exec2(cmdText, {as:"json"})
      }
      
      // Do upload
      if(this.myHome) {
        this.$adaptList.openLocalFileSelectdDialog()
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
        let newMeta = await Wn.EditObjMeta(this.CurrentFile, options)
        if(newMeta) {
          this.$adaptList.setItem(newMeta)
        }
      }
    },
    //--------------------------------------
    // Reloading
    //--------------------------------------
    async reloadData() {
      if(this.dataHome && this.dirName) {
        this.myStatus.reloading = true
        let hmph = Ti.Util.appendPath(this.dataHome, this.dirName)
        let home = await Wn.Io.loadMeta(hmph)
        // Guard
        if(!home) {
          this.myHome = null
          this.myData = {}
        }
        // Update data
        else {
          let reo = await Wn.Io.loadChildren(home)
          this.myHome = home
          this.myData = reo
        }
        _.delay(()=>{
          this.myStatus.reloading = false
        }, 100)
      }
      // Reset
      else {
        this.myHome = null
        this.myData = {}
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  watch : {
    "dataHome" : {
      handler : "reloadData",
      immediate : true
    }
  }
  ///////////////////////////////////////////
}
export default _M