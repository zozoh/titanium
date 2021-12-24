const _M = {
  ///////////////////////////////////////////
  data: () => ({
  }),
  ///////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    EventRouting() {
      let routing = _.get(this.schema, "events") || {}
      return _.assign({
        "block:show": "showBlock",
        "block:hide": "hideBlock",
        "search::list::select": "OnSearchListSelect",
        "search::filter::filter:change": "OnSearchFilterChange",
        "search::filter::sorter:change": "OnSearchSorterChange",
        "search::pager::change": "OnSearchPagerChange"
      }, routing)
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods: {
    //--------------------------------------
    async OnSearchListSelect({ currentId, checkedIds, checked }) {
      await this.dispatch("selectMeta", { currentId, checkedIds })
      this.$notify("indicate", `${checked.length} items selected`)
    },
    //--------------------------------------
    async OnSearchFilterChange(payload) {
      await this.dispatch("applyFilter", payload)
    },
    //--------------------------------------
    async OnSearchSorterChange(payload) {
      await this.dispatch("applySorter", payload)
    },
    //--------------------------------------
    async OnSearchPagerChange(payload) {
      await this.dispatch("applyPager", payload)
    },
    //--------------------------------------
    //
    //  Show/Hide block
    //
    //--------------------------------------
    showBlock(blockName) {
      let blockNames = Ti.S.splitIgnoreBlank(blockName, /[;,\s]+/g)
      //console.log(blockNames)
      let guiShown = {}
      _.forEach(blockNames, nm => {
        guiShown[nm] = true
      })
      this.commit("setGuiShown", guiShown)
    },
    //--------------------------------------
    hideBlock(blockName) {
      let blockNames = Ti.S.splitIgnoreBlank(blockName, /[;,\s]+/g)
      //console.log(blockNames)
      let guiShown = _.cloneDeep(this.guiShown) || {}
      _.forEach(blockNames, nm => {
        guiShown[nm] = false
      })
      this.commit("setGuiShown", guiShown)
    },
    //--------------------------------------
    //
    //  Utility
    //
    //--------------------------------------
    async dispatch(name, payload) {
      let path = Ti.Util.appendPath(this.moduleName, name)
      return await Ti.App(this).dispatch(path, payload)
    },
    //--------------------------------------
    commit(name, payload) {
      let path = Ti.Util.appendPath(this.moduleName, name)
      return Ti.App(this).commit(path, payload)
    },
    //--------------------------------------
    getCheckedItems(noneAsAll = false) {
      let ids = this.checkedIds || {}
      let alwaysOn = _.isEmpty(ids) && noneAsAll
      let items = _.filter(this.list, li => {
        return li && (alwaysOn || ids[li.id])
      })
      return items
    },
    //--------------------------------------
    //
    // Events / Callback
    //
    //--------------------------------------
    fire(name, payload) {
      let func = this.__on_events(name, payload)
      if (_.isFunction(func)) {
        func.apply(this, [payload])
      }
    },
    //--------------------------------------
    // For Event Bubble Dispatching
    __on_events(name, payload) {
      //console.log("WnThAdaptor.__on_events", name, payload)
      // ByPass
      if (/^(indicate)$/.test(name)) {
        return ()=>({ stop: false })
      }

      // Try routing
      let fn = _.get(this.EventRouting, name)
      if (!fn) {
        fn = this.$tiEventTryFallback(name, this.EventRouting)
      }

      // callPath -> Function
      let func;
      if (_.isString(fn)) {
        func = _.get(this, fn)
        if (!_.isFunction(func)) {
          func = Ti.Util.genInvoking(fn, {
            context: this.GuiExplainContext,
            dft: null,
            funcSet: this
          })
        }
      }
      if (_.isFunction(func)) {
        if (!_.isUndefined(payload)) {
          return () => {
            func(payload)
          }
        }
        return func
      }
    },
    //--------------------------------------
    // __ti_shortcut(uniqKey) {      
    // }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  created: function () {
  },
  ///////////////////////////////////////////
  mounted: async function () {
    // Update the customized actions
    let actions = this.thingActions || []
    if (_.isArray(actions)) {
      this.$notify("actions:update", actions)
    }
  },
  ///////////////////////////////////////////
  beforeDestroy: function () {
  }
  ///////////////////////////////////////////
}
export default _M;