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
        data : "=listData"
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
          this.currentMeta = reo
          this.listData.splice(this.currentIndex, 1, reo)

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
    async reload() {
      console.log("reload fileset list")
      this.listData = await this.reloadChildren()
    }
    //------------------------------------------------
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