const _M = {
  ///////////////////////////////////////////
  provide : function() {
    return {
      $ThingManager : this
    }
  },
  ///////////////////////////////////////////
  data: ()=>({
    "myRouting": {}
  }),
  ///////////////////////////////////////////
  props : {
    // Thing Set Home
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "currentDataHome" : {
      type : String,
      default : undefined
    },
    "currentDataHomeObj" : {
      type : Object,
      default : undefined
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
    },
    "keepLastSelection": {
      type: Boolean,
      default: true
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
    TheKeepLastKey() {
      if(this.keepLastSelection) {
        return _.get(this.meta, "id") + ":currentId";
      }
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
    },
    //--------------------------------------
    EventRouting() {
      return _.assign({
        "block:show"      : "showBlock",
        "block:hide"      : "hideBlock",
        "block:shown"     : "changeShown",
        "filter::change"  : "OnFilterChange",
        "sorter::change"  : "OnSorterChange",
        "list::select"    : "OnListSelect",
        "list::open"      : "OnListOpen",
        "content::change" : "OnContentChange",
        "pager::change"   : "OnPagerChange"
      }, _.get(this.TheSchema, "events"), this.myRouting)
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    //
    //  Event handler
    //
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
      //console.log("OnListSelect", current)
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
    //
    //  Utility
    //
    //--------------------------------------
    addEventRouting(eventName, handler) {
      this.$set(this.myRouting, eventName, handler)
    },
    removeEventRouting(...names) {
      let routing = _.omitBy(this.myRouting, (_, key)=>names.indexOf(key)>=0)
      this.myRouting = routing
    },
    //--------------------------------------
    //
    // Callback
    //
    //--------------------------------------
    // For Event Bubble Dispatching
    __on_events(name) {
      //console.log("__on_events", name)
      // Try to get handler
      let fn = _.get(this.EventRouting, name)
      if(!fn) {
        fn = this.$tiEventTryFallback(name, this.EventRouting)
      }

      // callPath -> Function
      if(_.isString(fn)) {
        return _.get(this, fn)
      }
      return fn
    },
    // Shortcut 
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
    let actions = _.get(this.config, "actions")
    if(_.isArray(actions)) {
      this.$notify("actions:update", actions)
    }
  }
  ///////////////////////////////////////////
}
export default _M;