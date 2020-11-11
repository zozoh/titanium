export default {
  ////////////////////////////////////////////////////
  data: ()=>({
    updating : false,
    saving : false,
    reloading : undefined,
    listData : [],
    currentIndex : undefined,
    currentMeta : undefined,
    currentContent : undefined,
    loadedCurrentContent : undefined,
    metaFieldStatus : {}
  }),
  ////////////////////////////////////////////////////
  props : {
    "match" : {
      type : Object,
      default : ()=>({
        race : "FILE"
      })
    },
    "createTip" : {
      type : String,
      default : "i18n:wn-fsc-mail-tmpl-new"
    },
    "listSize" : {
      type : [Number, String],
      default : 0.3
    },
    "listIcon" : {
      type : String,
      default : "far-list-alt"
    },
    "listTitle" : {
      type : String,
      default : "i18n:list"
    },
    "listType" : {
      type : String,
      default : "TiList"
    },
    "listConf" : {
      type : Object,
      default : ()=>({})
    },
    "metaSize" : {
      type : [Number, String],
      default : 0.3
    },
    "metaIcon" : {
      type : String,
      default : "fas-info-circle"
    },
    "metaTitle" : {
      type : String,
      default : "i18n:properties"
    },
    "metaType" : {
      type : String,
      default : "TiForm"
    },
    "metaConf" : {
      type : Object,
      default : ()=>({})
    },
    "detailSize" : {
      type : [Number, String],
      default : undefined
    },
    "detailIcon" : {
      type : String,
      default : "fas-info-circle"
    },
    "detailTitle" : {
      type : String,
      default : "i18n:detail"
    },
    "detailType" : {
      type : String,
      default : "TiTextRaw"
    },
    "detailConf" : {
      type : Object,
      default : ()=>({})
    },
    "autoSelect" : {
      type : Boolean,
      default : true
    },
    "autoKeepSelectBy" : {
      type : String,
      default : "CURRENT_ID"
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    isCurrentContentChanged() {
      if(this.currentMeta) {
        return this.currentContent != this.loadedCurrentContent
      }
    },
    //------------------------------------------------
    hasCurrent() {
      return this.currentMeta ? true : false
    },
    //------------------------------------------------
    isGUILoading() {
      return this.updating || this.reloading || this.saving
    },
    //------------------------------------------------
    CurrentId() {
      return _.get(this.currentMeta, "id")
    },
    //------------------------------------------------
    GUILayout() {
      let listBlock = {
        title : this.listTitle,
        icon  : this.listIcon,
        name  : "list",
        size  : this.listSize,
        body  : "list"
      }
      let metaBlock = {
        title : this.metaTitle,
        icon  : this.metaIcon,
        size  : this.metaSize,
        name  : "meta",
        body  : "meta"
      }
      let detailBlock = {
        title : this.detailTitle,
        icon  : this.detailIcon,
        size  : this.detailSize,
        name  : "detail",
        body  : "detail",
        actions : [{
            name : "saving",
            text : "i18n:save",
            icon : "zmdi-floppy",
            altDisplay : {
              "icon" : "fas-spinner fa-pulse",
              "text" : "i18n:saving"
            },
            enabled : "changed",
            action : ()=> {
              this.doSaveCurrentContent()
            }
          }, {
            name : "reloading", 
            text : "i18n:reload",
            icon : "fas-sync",
            altDisplay : {
              "icon" : "fas-sync fa-pulse",
              "text" : "i18n:reloading"
            },
            enabled : "current",
            action : ()=> {
              this.doReloadCurrentContent()
            }
          }]
      }
      if(this.metaType && this.detailType) {
        return {
          type : "cols",
          border : true,
          blocks : [listBlock, {
              type : "rows",
              border : true,
              blocks : [metaBlock, detailBlock]
            }]
        }
      }
      if(this.metaType) {
        return {
          type : "cols",
          className : "show-border",
          blocks : [listBlock, metaBlock]
        }
      }
      return {
        type : "cols",
        className : "show-border",
        blocks : [listBlock, detailBlock]
      }
    },
    //------------------------------------------------
    GUISchema() {
      //..............................................
      let listConf = _.defaults({}, this.listConf, {
        onBeforeChangeSelect : async ()=>{
          if(!(await Ti.Fuse.get().fire())) {
            return false
          }
        },
        changedId : this.isCurrentContentChanged
          ? this.CurrentId
          : undefined,
        display : ["<icon:far-file>", "title|nm"],
        data : "=listData",
        onInit : ($list) => {
          this.$list = $list
        }
      })
      //..............................................
      let metaConf = _.defaults({}, this.metaConf, {
        autoShowBlank : true,
        blankAs : {
          icon : "fas-brush",
          text : "i18n:blank-to-edit"
        },
        data : "=currentMeta",
        fieldStatus : "=metaFieldStatus",
        fields : [{
          title: "i18n:wn-key-title",
          name : "title",
          comType : "ti-input"
        }, {
          title: "i18n:wn-key-nm",
          name : "nm",
          comType : "ti-input"
        }]
      })
      //..............................................
      let detailConf = _.defaults({}, this.detailConf, {
        value : "=currentContent"
      })
      //..............................................
      return {
        list : {
          comType : this.listType,
          comConf : Ti.Util.explainObj(this, listConf)
        },
        meta : {
          comType : this.metaType,
          comConf : Ti.Util.explainObj(this, metaConf)
        },
        detail : {
          comType : this.detailType,
          comConf : Ti.Util.explainObj(this, detailConf)
        }
      }
    },
    //------------------------------------------------
    DetailActionStatus() {
      return {
        saving : this.saving,
        reloading : this.reloading,
        changed : this.isCurrentContentChanged,
        current : this.hasCurrent
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    async OnListSelect({current, currentIndex}) {
      if(!current) {
        this.currentIndex = undefined
        this.currentMeta = undefined
        this.currentContent = undefined
      } else {
        this.currentIndex = currentIndex
        this.currentMeta = current
        await this.doReloadCurrentContent()
        this.metaFieldStatus = {}
      }
    },
    //------------------------------------------------
    OnListOpen() {
      // DO nothing
    },
    //------------------------------------------------
    OnMetaChange(payload) {
      // DO nothing
    },
    //------------------------------------------------
    async OnMetaFieldChange({name, value}) {
      if(this.hasCurrent) {
        this.updating = true
        this.metaFieldStatus = {
          [name] : {type : "spinning"}
        }
        try {
          let reo = await Wn.Io.update(this.currentMeta, {
            [name]: value
          })
          this.updateCurrentMeta(reo)

          this.$nextTick(()=>{
            this.metaFieldStatus = {
              [name] : {type : "ok"}
            }
            _.delay(()=>{
              this.metaFieldStatus = {}
            }, 800)
          })
        }
        // Error
        catch(err) {
          this.metaFieldStatus = {
            [name] : {
              type : "error",
              text : err.errMsg
            }
          }
        }
        // unmark
        finally {
          this.updating = false
        }
      }
    },
    //------------------------------------------------
    OnDetailChange(content) {
      this.currentContent = content
    },
    //------------------------------------------------
    async doCreate() {
      //console.log("doCreate for ", this.meta.ph)
      let newName = _.trim(await Ti.Prompt(this.createTip))

      if(!newName)
        return

      let cmdText = `touch id:${this.meta.id}/${newName}`
      await Wn.Sys.exec(cmdText)

      // Reload
      await this.reload()

      // Highlight it
      let li = this.findDataInListByName(newName)

      if(li && this.$list) {
        this.$nextTick(()=>{
          this.$list.selectRow(li.id)          
        })
      }
      
    },
    //------------------------------------------------
    async doDelete() {
      if(this.hasCurrent && this.findIndexInList() >= 0) {
        this.reloading = true
        await Wn.Sys.exec(`rm id:${this.currentMeta.id}`)
        await this.reload()
        this.currentIndex = undefined
        this.currentMeta = undefined
        this.currentContent = undefined
      }
      // Warn user
      else {
        return await Ti.Toast.Open('i18n:wn-del-none', "warn")
      }
    },
    //------------------------------------------------
    async doRename() {
      if(this.hasCurrent && this.findIndexInList() >= 0) {
        // Get newName from User input
        let newName = await Ti.Prompt({
          text : 'i18n:wn-rename',
          vars : {name:this.currentMeta.nm}
        }, {
          title : "i18n:rename",
          placeholder : this.currentMeta.nm,
          value : this.currentMeta.nm
        })

        // Check name invalid or not
        if(!Wn.Obj.isValidName(newName)) {
          return
        }

        this.reloading = true
        // Do the rename
        let newMeta = await Wn.Sys.exec2(
          `obj id:${this.CurrentId} -cqno -u 'nm:"${newName}"'`,
          {as:"json"})

        // Error
        if(newMeta instanceof Error) {
          await Ti.Toast.Open("i18n:wn-rename-fail", "error")
        }
        // Replace the data
        else {
          await Ti.Toast.Open("i18n:wn-rename-ok", "success")
          this.updateCurrentMeta(newMeta)
        }
        this.$nextTick(()=>{
          this.reloading = false
        })
      }
      // Warn user
      else {
        return await Ti.Toast.Open('i18n:wn-rename-none', "warn")
      }
    },
    //------------------------------------------------
    async openCurrentMeta() {
      let reo = await Wn.EditObjMeta(this.currentMeta, {fields:"auto"})

      if(reo) {
        let {data, saved} = reo
        if(saved) {
          this.updateCurrentMeta(data)
        }
      }
    },
    //------------------------------------------------
    async openContentEditor() {
      let text = await Wn.EditObjContent(this.currentMeta, {
        autoSave : true
      })

      // User cancel
      if(Ti.Util.isNil(text))
        return

      // Update content
      this.currentContent = text
      this.loadedCurrentContent = text
    },
    //------------------------------------------------
    findIndexInList(meta=this.currentMeta) {
      if(meta) {
        let i = -1;
        for(let li of this.listData) {
          i++
          if(li.id == meta.id)
            return  i
        }
      }
      return -1
    },
    //------------------------------------------------
    findDataInListByName(name) {
      if(name) {
        for(let li of this.listData) {
          if(li.nm == name)
            return  li
        }
      }
    },
    //------------------------------------------------
    getCurrentMeta() {
      return _.cloneDeep(this.currentMeta)
    },
    //------------------------------------------------
    updateCurrentMeta(meta) {
      if(this.hasCurrent) {
        this.currentMeta = meta
        this.listData.splice(this.currentIndex, 1, meta)
        if(this.$list) {
          this.$nextTick(()=>{
            this.$list.selectRow(meta.id, {quiet:true})
          })
        }
      }
    },
    //------------------------------------------------
    async doSaveCurrentContent() {
      if(this.hasCurrent && this.isCurrentContentChanged) {
        this.saving = true
        await Wn.Io.saveContentAsText(this.currentMeta, this.currentContent)
        this.loadedCurrentContent = this.currentContent
        this.$nextTick(()=>{
          this.saving = false
        })
      }
    },
    //------------------------------------------------
    async doReloadCurrentContent() {
      if(this.hasCurrent) {
        this.reloading = true
        this.currentContent = await Wn.Io.loadContent(this.currentMeta, {as:"text"})
        this.loadedCurrentContent = this.currentContent
        this.$nextTick(()=>{
          this.reloading = false
        })
      }
    },
    //------------------------------------------------
    autoSelectItem() {
      if(!this.autoSelect)
        return

      if(_.isEmpty(this.listData)) 
        return

      // Recover current selected before
      let rowId;
      if(this.autoKeepSelectBy) {
        let key = `${this.meta.id}_${this.autoKeepSelectBy}`
        rowId = Ti.Storage.session.get(key)
      }

      // Select the first one
      if(Ti.Util.isNil(rowId)) {
        let row = this.$list.getRow(0)
        rowId = _.get(row,  "id")
      }
      
      // Recover the previous selection
      if(!Ti.Util.isNil(rowId)) {
        this.$list.selectRow(rowId)
      }
    },
    //------------------------------------------------
    async reload() {
      this.reloading = true
      this.listData = await this.reloadChildren()
      this.$nextTick(()=>{
        this.reloading = false
        this.$nextTick(()=>{
          this.autoSelectItem()
        })
      })
    }
    //------------------------------------------------
  },
  watch : {
    "isCurrentContentChanged" : function(changed) {
      Ti.App(this).commit("current/setStatus", {
        changed
      })
    },
    "currentMeta" : function(newVal, oldVal) {
      if(this.meta && !_.isEqual(newVal, oldVal) && this.autoKeepSelectBy) {
        let key = `${this.meta.id}_${this.autoKeepSelectBy}`
        if(newVal) {
          Ti.Storage.session.set(key, newVal.id)
        } else {
          Ti.Storage.session.remove(key)
        }
      }
    }
  },
  ////////////////////////////////////////////////////
  mounted : function(){
    //------------------------------------------------
    Ti.Fuse.getOrCreate().add({
      key : "wn-fileset-list",
      everythingOk : ()=>{
        return !this.isCurrentContentChanged
      },
      fail : ()=>{
        Ti.Toast.Open("i18n:wn-obj-nosaved", "warn")
      }
    })
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-fileset-list")
  }
  ////////////////////////////////////////////////////
}