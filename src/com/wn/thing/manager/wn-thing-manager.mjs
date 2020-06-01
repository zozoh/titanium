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
    ...Vuex.mapGetters("main/search", [
      "currentItem", 
      "checkedItems"
    ]),
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
      if(this.currentItem && this.current.status.changed) {
        return this.currentItem.id
      }
    },
    //--------------------------------------
    GuiLoadingAs() {
      let key = _.findKey(this.status, (v)=>v)
      return _.get(this.TheLoadingAs, key)
    },
    //--------------------------------------
    curentThumbTarget() {
      if(this.currentItem) {
        let th_set = this.meta.id
        return `id:${th_set}/data/${this.currentItem.id}/thumb.jpg`
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
    async OnFilterChange(filter) {
      Ti.App(this).commit("main/search/setFilter", filter)
      await Ti.App(this).dispatch("main/reloadSearch")
    },
    //--------------------------------------
    async OnSorterChange(sort={}) {
      Ti.App(this).commit("main/search/setSorter", sort)
      await Ti.App(this).dispatch("main/reloadSearch")
    },
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
    // Batch Update
    //--------------------------------------
    async batchUpdate() {
      //....................................
      // Prepare the data
      if(_.isEmpty(this.checkedItems)) {
        return Ti.Toast.Open("i18n:batch-none", "warn")
      }
      let current = _.first(this.checkedItems)
      //....................................
      let batch = _.get(this.config, "schema.behavior.batch") || {}
      _.defaults(batch, {
        "comType" : "wn-obj-form",
        "comConf" : {},
        "fields" : "schema.meta.comConf.fields",
        "names" : null,
        "valueKey": "data"
      })
      batch.comType = _.kebabCase(batch.comType)
      // Add default setting
      if(/^(ti-|wn-obj-)(form)$/.test(batch.comType)) {
        _.defaults(batch.comConf, {
          autoShowBlank: false,
          updateBy: true,
          setDataBy: true
        })
      }
      //....................................
      let name_filter;
      if(_.isString(batch.names)) {
        if(batch.names.startsWith("^")){
          let regex = new RegExp(batch.names)
          name_filter = fld => regex.test(fld.name)
        }
        else if(batch.names.startsWith("!^")){
          let regex = new RegExp(batch.names.substring(1))
          name_filter = fld => !regex.test(fld.name)
        }
        else {
          let list = Ti.S.toArray(batch.names)
          name_filter = fld => list.indexOf(fld.name)>=0
        }
      }
      // Filter by Array
      // TODO maybe I should use the validate
      else if(_.isArray(batch.names) && !_.isEmpty(batch.names)) {
        name_filter = v => batch.name.indexOf(v)>=0
      }
      // Allow all
      else {
        name_filter = fld => true
      }

      //....................................
      // Prepare the fields
      let fields = _.get(this.config, batch.fields)
      //....................................
      // filter names
      if(!_.isEmpty(batch.names)) {
        // Define the filter
        const filter_names = function(flds=[], filter) {
          let list = []
          for(let fld of flds) {
            // Group
            if(_.isArray(fld.fields)) {
              let f2 = _.cloneDeept(fld)
              f2.fields = filter_names(fld.fields, names)
              if(!_.isEmpty(f2.fields)) {
                list.push(f2)
              }
            }
            // Fields
            else if(filter(fld)) {
              list.push(fld)
            }
          }
          return list
        }
        // Do filter
        fields = filter_names(fields, name_filter)
      }
      //....................................
      // Open the Modal
      let updates = await Ti.App.Open({
        title: "i18n:batch-update",
        width: 640,
        height: "90%",
        position: "top",
        //............................
        comType: "inner-body",
        //............................
        components: [{
          name: "inner-body",
          globally : false,
          data: {
            update: {},
            value: current,
            innerComConf: {
              ... batch.comConf,
              fields
            }
          },
          template: `<${batch.comType}
            v-bind="innerComConf"
            :${batch.valueKey}="value"
            @field:change="OnFieldChange"
            @change="OnChange"/>`,
          methods: {
            OnFieldChange({name, value}){
              _.set(this.update, name, value)
              this.$notify("change", this.update)
            },
            OnChange(payload) {
              this.value = payload
            }
          }
        }]
        //............................
      })
      //....................................
      if(!_.isEmpty(updates)) {
        // Get all checkes
        await Ti.App(this).dispatch("main/batchUpdateMetas", updates)
      }
    },
    //--------------------------------------
    // Utility
    //--------------------------------------
    async viewCurrentSource() {
      // Guard
      if(!this.currentItem) {
        return await Ti.Toast.Open("i18n:empty-data", "warn")
      }
      // Open Editor
      let newContent = await Wn.EditObjContent(this.currentItem, {
        showEditorTitle : false,
        icon      : Wn.Util.getObjIcon(this.currentItem, "zmdi-tv"),
        title     : Wn.Util.getObjDisplayName(this.currentItem),
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
    },
    //--------------------------------------
    // Callback
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-form", uniqKey)
      if("ESCAPE" == uniqKey) {
        if(this.TheShown.creator) {
          this.hideBlock("creator")
        }
      }
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