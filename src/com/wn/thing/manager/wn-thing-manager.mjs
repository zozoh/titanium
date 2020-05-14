const _M = {
  ///////////////////////////////////////////
  provide : function() {
    return {
      "$ThingManager" : this
    }
  },
  ///////////////////////////////////////////
  props : {
    // Thing Set Home
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "currentDataHome" : {
      type : String,
      default : null
    },
    "currentDataDir" : {
      type : String,
      default : "media"
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    "config" : {
      type : Object,
      default : ()=>({})
    },
    "search" : {
      type : Object,
      default : ()=>({})
    },
    "current" : {
      type : Object,
      default : ()=>({})
    },
    "files" : {
      type : Object,
      default : ()=>({})
    },
    "preview" : {
      type : Object,
      default : ()=>({})
    },
    "emitChange": {
      type : Boolean,
      default: false
    }
  },
  ///////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    TheShown() {
      return _.get(this.config, "shown") || {}
    },
    //--------------------------------------
    TheLayout() {
      return Ti.Util.explainObj(this, this.config.layout)
    },
    //--------------------------------------
    TheSchema() {
      return Ti.Util.explainObj(this, this.config.schema)
    },
    //--------------------------------------
    TheLoadingAs() {
      return _.assign({
        "reloading" : {
          icon : "fas-spinner fa-spin",
          text : "i18n:loading"
        },
        "saving" : {
          icon : "zmdi-settings fa-spin",
          text : "i18n:saving"
        },
        "deleting" : {
          icon : "zmdi-refresh fa-spin",
          text : "i18n:del-ing"
        },
        "publishing" : {
          icon : "zmdi-settings zmdi-hc-spin",
          text : "i18n:publishing"
        },
        "restoring" : {
          icon : "zmdi-time-restore zmdi-hc-spin",
          text : "i18n:thing-restoring"
        },
        "cleaning" : {
          icon : "zmdi-settings zmdi-hc-spin",
          text : "i18n:thing-cleaning"
        }
      }, _.get(this.TheSchema, "loadingAs"))
    },
    //--------------------------------------
    ChangedRowId() {
      if(this.current && this.current.meta && this.current.status.changed) {
        return this.current.meta.id
      }
    },
    //--------------------------------------
    GuiLoadingAs() {
      let key = _.findKey(this.status, (v)=>v)
      return _.get(this.TheLoadingAs, key)
    },
    //--------------------------------------
    curentThumbTarget() {
      if(this.current.meta) {
        let th_set = this.meta.id
        return `id:${th_set}/data/${this.current.meta.id}/thumb.jpg`
      }
      return ""
    },
    //--------------------------------------
    SchemaMethods() {
      if(this.TheSchema && this.TheSchema.methods) {
        return Ti.Util.merge({}, this.TheSchema.methods)
      }
      return {}
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnListSelect({current, currentId, checkedIds, checked}) {
      Ti.App(this).dispatch("main/setCurrentThing", {
        meta: current, 
        currentId,
        checkedIds
      })
      if(this.emitChange) {
        this.$emit("change", {current, currentId, checkedIds, checked})
      }
    },
    //--------------------------------------
    OnListOpen({rawData}) {
      let app = Ti.App(this)
      app.dispatch("main/config/updateShown", this.config.listOpen)
      // Update Current
      app.dispatch("main/setCurrentThing", {meta: rawData})
    },
    //--------------------------------------
    OnContentChange(content) {
      let app = Ti.App(this)
      app.dispatch("main/current/changeContent", content)
      app.commit("main/syncStatusChanged")
    },
    //--------------------------------------
    OnPagerChange({pn, pgsz}={}) {
      //console.log("OnPagerChange", {pn, pgsz})
      Ti.App(this).dispatch("main/search/reloadPage", {pn, pgsz})
    },
    //--------------------------------------
    OnViewCurrentSource() {
      this.viewCurrentSource()
    },
    //--------------------------------------
    // Show hide block
    //--------------------------------------
    async changeShown(shown={}) {
      Ti.App(this).dispatch("main/doChangeShown", shown)
    },
    //--------------------------------------
    showBlock(name) {
      //console.log("showBlock", name)
      // If creator, then must leave the recycle bin
      if("creator" == name) {
        if(this.status.inRecycleBin) {
          Ti.Alert("i18n:thing-create-in-recyclebin", {
            title : "i18n:warn",
            icon  : "im-warning",
            type  : "warn"
          })
          return
        }
      }
      if("files" == name) {
        Ti.App(this).dispatch("main/reloadFiles")
      }
      else if("content" == name) {
        //Ti.App(this).dispatch("main/reloadFiles")
        Ti.App(this).dispatch("main/current/reload")
      }
      // Mark block
      Ti.App(this).dispatch("main/doChangeShown", {[name]:true})
    },
    //--------------------------------------
    hideBlock(name) {
      Ti.App(this).dispatch("main/doChangeShown", {[name]:false})
    },
    //--------------------------------------
    toggleBlock(name) {
      Ti.App(this).dispatch("main/doChangeShown", {
        [name]: !this.TheShown[name]
      })
    },
    //--------------------------------------
    // Utility
    //--------------------------------------
    async viewCurrentSource() {
      // Guard
      if(!this.current.meta) {
        return await Ti.Toast.Open("i18n:empty-data", "warn")
      }
      // Open Editor
      let newContent = await Wn.EditObjContent(this.current.meta, {
        showEditorTitle : false,
        icon      : Wn.Util.getObjIcon(this.current.meta, "zmdi-tv"),
        title     : Wn.Util.getObjDisplayName(this.current.meta),
        width     : "61.8%",
        height    : "96%",
        content   : this.current.content,
        saveBy    : null
      })

      //console.log(newContent)

      // Cancel the editing
      if(_.isUndefined(newContent)) {
        return
      }

      // Update the current editing
      Ti.App(this).dispatch("main/setCurrentContent", newContent)
    },
    //--------------------------------------
    async invoke(fnName) {
      //console.log("invoke ", fnName)
      let fn = _.get(this.SchemaMethods, fnName)
      // Invoke the method
      if(_.isFunction(fn)) {
        return await fn.apply(this, [])
      }
      // Throw the error
      else {
        throw Ti.Err.make("e.thing.fail-to-invoke", fnName)
      }
    },
    //--------------------------------------
    checkActionsUpdate() {
      //console.log("checkActionsUpdate")
      let actions = _.get(this.config, "actions")
      if(_.isArray(actions)) {
        this.$notify("actions:update", actions)
      }
    },
    //--------------------------------------
    async reloadCurrentFiles() {
      await this.$files.reloadData()
    },
    //--------------------------------------
    async deleteCurrentSelectedFiles() {
      await this.$files.doDeleteSelected()
    },
    //--------------------------------------
    async uploadFilesToCurrent() {
      await this.$files.doUploadFiles()
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  mounted : function() {
    // Mark self in order to let `thing-files` set self
    // to root `wn-thing-manager` instance
    // then `openLocalFileSelectdDialogToUploadFiles`
    // can assess the `thing-files` instance directly.
    this.THING_MANAGER_ROOT = true

    // Update the customized actions
    this.checkActionsUpdate()
  }
  ///////////////////////////////////////////
}
export default _M;