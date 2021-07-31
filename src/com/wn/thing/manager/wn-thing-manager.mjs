const _M = {
  ///////////////////////////////////////////
  provide: function () {
    return {
      $ThingManager: this
    }
  },
  ///////////////////////////////////////////
  data: () => ({
    "myRouting": {}
  }),
  ///////////////////////////////////////////
  props: {
    // Thing Set Home
    "meta": {
      type: Object,
      default: () => ({})
    },
    "moduleName": {
      type: String,
      default: "main"
    },
    "currentDataHome": {
      type: String,
      default: undefined
    },
    "currentDataHomeObj": {
      type: Object,
      default: undefined
    },
    "currentDataDir": {
      type: String,
      default: undefined
    },
    "status": {
      type: Object,
      default: () => ({})
    },
    "rootState": {
      type: Object
    },
    "config": {
      type: Object,
      default: () => ({})
    },
    "search": {
      type: Object,
      default: () => ({})
    },
    "current": {
      type: Object,
      default: () => ({})
    },
    "files": {
      type: Object,
      default: () => ({})
    },
    "preview": {
      type: Object,
      default: () => ({})
    },
    "emitChange": {
      type: Boolean,
      default: false
    },
    "keepLastSelection": {
      type: Boolean,
      default: true
    },
    //-----------------------------------
    // Callback
    //-----------------------------------
    "whenCreated": {
      type: Function
    },
    "whenMounted": {
      type: Function
    },
    "whenBeforeDestroy": {
      type: Function
    }
  },
  ///////////////////////////////////////////
  computed: {
    //--------------------------------------
    currentItem() {
      let path = Ti.Util.appendPath(this.moduleName, "search/currentItem")
      return Ti.App(this).$store().getters[path]
    },
    //--------------------------------------
    checkedItems() {
      let path = Ti.Util.appendPath(this.moduleName, "search/checkedItems")
      return Ti.App(this).$store().getters[path]
    },
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
      if (this.keepLastSelection) {
        return _.get(this.meta, "id") + ":currentId";
      }
    },
    //--------------------------------------
    TheGuiVars() {
      return this
    },
    //--------------------------------------
    CurrentIsDead() {
      return -1 == _.get(this.current, "meta.th_live")
    },
    //--------------------------------------
    CurrentHeadClass() {
      if (this.CurrentIsDead) {
        return "current-in-recyclebin"
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
        "reloading": {
          icon: "fas-spinner fa-spin",
          text: "i18n:loading"
        },
        "saving": {
          icon: "zmdi-settings fa-spin",
          text: "i18n:saving"
        },
        "deleting": {
          icon: "zmdi-refresh fa-spin",
          text: "i18n:del-ing"
        },
        "publishing": {
          icon: "zmdi-settings zmdi-hc-spin",
          text: "i18n:publishing"
        },
        "restoring": {
          icon: "zmdi-time-restore zmdi-hc-spin",
          text: "i18n:thing-restoring"
        },
        "cleaning": {
          icon: "zmdi-settings zmdi-hc-spin",
          text: "i18n:thing-cleaning"
        }
      }, _.get(this.TheSchema, "loadingAs"))
    },
    //--------------------------------------
    ChangedRowId() {
      if (this.currentItem && this.current.status.changed) {
        return this.currentItem.id
      }
    },
    //--------------------------------------
    GuiLoadingAs() {
      let key = _.findKey(this.status, (v) => v)
      return _.get(this.TheLoadingAs, key)
    },
    //--------------------------------------
    curentThumbTarget() {
      if (this.currentItem) {
        let th_set = this.meta.id
        return `id:${th_set}/data/${this.currentItem.id}/thumb.jpg`
      }
      return ""
    },
    //--------------------------------------
    SchemaMethods() {
      if (this.TheSchema && this.TheSchema.methods) {
        return Ti.Util.merge({}, this.TheSchema.methods)
      }
      return {}
    },
    //--------------------------------------
    EventRouting() {
      return _.assign({
        "block:show": "showBlock",
        "block:hide": "hideBlock",
        "block:shown": "changeShown",
        "filter::change": "OnFilterChange",
        "sorter::change": "OnSorterChange",
        "list::select": "OnListSelect",
        "list::open": "OnListOpen",
        "content::change": "OnContentChange",
        "pager::change": "OnPagerChange"
      }, _.get(this.TheSchema, "events"), this.myRouting)
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods: {
    //--------------------------------------
    //
    //  Event handler
    //
    //--------------------------------------
    async OnFilterChange(filter) {
      this.commit("search/setFilter", filter)
      await this.dispatch("reloadSearch")
    },
    //--------------------------------------
    async OnSorterChange(sort = {}) {
      this.commit("search/setSorter", sort)
      await this.dispatch("reloadSearch")
    },
    //--------------------------------------
    OnListSelect({ current, currentId, checkedIds, checked }) {
      //console.log("OnListSelect", current)
      this.dispatch("setCurrentThing", {
        meta: current,
        currentId,
        checkedIds
      })

      if (this.emitChange) {
        this.$emit("change", { current, currentId, checkedIds, checked })
      }
    },
    //--------------------------------------
    OnListOpen({ rawData }) {
      this.dispatch("config/updateShown", this.config.listOpen)
      // Update Current
      this.dispatch("setCurrentThing", { meta: rawData })
    },
    //--------------------------------------
    OnContentChange(content) {
      this.dispatch("current/changeContent", content)
      this.commit("syncStatusChanged")
    },
    //--------------------------------------
    OnPagerChange({ pn, pgsz } = {}) {
      //console.log("OnPagerChange", {pn, pgsz})
      this.commit("search/updatePager", { pn, pgsz })
      this.dispatch("reloadSearch")
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
      let routing = _.omitBy(this.myRouting, (_, key) => names.indexOf(key) >= 0)
      this.myRouting = routing
    },
    async dispatch(name, payload) {
      let path = Ti.Util.appendPath(this.moduleName, name)
      return await Ti.App(this).dispatch(path, payload)
    },
    commit(name, payload) {
      let path = Ti.Util.appendPath(this.moduleName, name)
      return Ti.App(this).commit(path, payload)
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
      if (!fn) {
        fn = this.$tiEventTryFallback(name, this.EventRouting)
      }

      // callPath -> Function
      if (_.isString(fn)) {
        return _.get(this, fn)
      }
      return fn
    },
    // Shortcut 
    __ti_shortcut(uniqKey) {
      //console.log("ti-form", uniqKey)
      if ("ESCAPE" == uniqKey) {
        if (this.TheShown.creator) {
          this.hideBlock("creator")
        }
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  created: function () {
    if (_.isFunction(this.whenCreated)) {
      this.whenCreated(this)
    }
  },
  ///////////////////////////////////////////
  mounted: async function () {
    // Mark self in order to let `thing-files` set self
    // to root `wn-thing-manager` instance
    // then `openLocalFileSelectdDialogToUploadFiles`
    // can assess the `thing-files` instance directly.
    this.THING_MANAGER_ROOT = true

    // Update the customized actions
    let actions = _.get(this.config, "actions")
    if (_.isArray(actions)) {
      this.$notify("actions:update", actions)
    }

    if (_.isFunction(this.whenMounted)) {
      this.whenMounted(this)
    }
  },
  ///////////////////////////////////////////
  beforeDestroy: function () {
    if (_.isFunction(this.whenBeforeDestroy)) {
      this.whenBeforeDestroy(this)
    }
  }
  ///////////////////////////////////////////
}
export default _M;