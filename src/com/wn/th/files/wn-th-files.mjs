const _M = {
  ///////////////////////////////////////////
  data: () => ({
    $ta: null,
    myDataDirObj: null
  }),
  ///////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    hasDataHome() {
      return this.dataHome ? true : false
    },
    //--------------------------------------
    hasDirNameOptions() {
      return !_.isEmpty(this.dirNameOptions)
    },
    //--------------------------------------
    DataList() {
      return _.get(this.data, "list") || []
    },
    //--------------------------------------
    DataPager() {
      return _.get(this.data, "pager") || {}
    },
    //--------------------------------------
    CurrentFile() {
      if (this.currentId && this.DataList) {
        for (let it of this.DataList) {
          if (this.currentId == it.id) {
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
        showInfo: false,
        floatInfo: false,
        infoPosition: "left",
        infoNameWidth: 40,
        infoValueWidth: 120,
        stateLocalKey: this.getStateLocalKey("preview"),
        // Customized
        ...preview,
        // Edit Info 
        editInfoBy: () => {
          this.editPreviewInfo()
        }
      }
    },
    //--------------------------------------
    TheFiles() {
      return _.assign({}, this.files, {
        currentId: this.currentId,
        checkedIds: this.checkedIds,
        routers: {
          "reload": async () => {
            await this.reloadData()
          }
        }
      })
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnAdaptListInit($adaptlist) { this.$adaptlist = $adaptlist },
    //--------------------------------------
    // Events
    //--------------------------------------
    async OnDirNameChanged(dirName) {
      this.$ta.commit("setDataDirName", dirName)
      await this.reloadData();
    },
    //--------------------------------------
    OnFileSelect({ currentId, checkedIds }) {
      this.$ta.dispatch("selectDataFile", { currentId, checkedIds })
    },
    //--------------------------------------
    OnFileOpen(obj) {
      this.$notify("file:open", obj)
    },
    //--------------------------------------
    async OnFileUploaded(files = []) {
      if (!_.isEmpty(files)) {
        let checkedIds = {}
        for (let file of files) {
          checkedIds[file.id] = true
        }
        this.OnFileSelect({
          currentId: files[0].id,
          checkedIds
        })
      }
    },
    //--------------------------------------
    // Untility
    //--------------------------------------
    getStateLocalKey(name) {
      if (this.stateLocalKey && name) {
        return `${this.stateLocalKey}_${name}`
      }
    },
    //--------------------------------------
    getThAdaptor() {
      return this.tiParentCom("WnThAdaptor")
    },
    //--------------------------------------
    async doDeleteSelected() {
      await this.$ta.dispatch("dfRemoveChecked")
    },
    //--------------------------------------
    async checkDataDir() {
      // Guard
      if (!this.hasDataHome) {
        return
      }
      // If empty data home, create one
      if (!this.myDataDirObj && this.dirName) {
        let cmdText = `o @create -p ${this.dataHome} -auto -race DIR '${this.dirName}'`
        console.log(cmdText)
        await Wn.Sys.exec2(cmdText)

        this.myDataDirObj = await this.loadDataDirObj()
      }
    },
    //--------------------------------------
    async doUploadFiles() {
      // Guard
      await this.checkDataDir()

      // Do upload
      if (this.myDataDirObj) {
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
      if (this.CurrentFile) {
        let options = _.get(this.previewEdit, this.dirName)
        let reo = await Wn.EditObjMeta(this.CurrentFile, options)
        if (reo && reo.data) {
          this.updateItemInDataList(reo.data)
        }
      }
    },
    //--------------------------------------
    updateItemInDataList(meta) {
      if (meta && this.myData && _.isArray(this.myData.list)) {
        this.myData.list = _.map(
          this.myData.list,
          it => it.id == meta.id ? meta : it)
      }
    },
    //--------------------------------------
    // Reloading
    //--------------------------------------
    async loadDataDirObj() {
      if (this.dataHome) {
        let aph = Ti.Util.appendPath(this.dataHome, this.dirName)
        return await Wn.Io.loadMeta(aph)
      }
    },
    //--------------------------------------
    async reloadData() {
      if (this.dataHome && this.$ta) {
        this.myDataDirObj = await this.loadDataDirObj()
        if (this.myDataDirObj) {
          await this.$ta.dispatch("dfQueryFiles")
        } else {
          this.$ta.commit("setDataDirFiles")
        }
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  watch: {
    "dirName": "reloadData"
  },
  ///////////////////////////////////////////
  mounted: async function () {
    this.$ta = this.getThAdaptor()
    await this.reloadData()
  }
  ///////////////////////////////////////////
}
export default _M