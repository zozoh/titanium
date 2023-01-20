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
        "block:shown": "updateBlockShown",
        "block:show": "showBlock",
        "block:hide": "hideBlock",
        "meta::change": "doNothing",
        "meta::field:change": "dispatch('batchUpdateCheckedItemsField')",
        "content::change": "OnContentChange",
        "save:change": "OnSaveChange",
        "list::select": "OnSearchListSelect",
        "filter::filter:change": "OnSearchFilterChange",
        "filter::sorter:change": "OnSearchSorterChange",
        "pager::change": "OnSearchPagerChange"
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
    OnContentChange(payload) {
      this.dispatch("changeContent", payload)
    },
    //--------------------------------------
    async OnSaveChange() {
      await this.dispatch("saveContent")
    },
    //--------------------------------------
    //
    //  Show/Hide block
    //
    //--------------------------------------
    updateBlockShown(shown = {}) {
      let guiShown = {}
      _.forEach(shown, (v, k) => {
        if (v) {
          guiShown[k] = true
        }
      })
      this.commit("setGuiShown", guiShown)
    },
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
      let items = this.GuiExplainContext.checkedItems;
      if (noneAsAll && _.isEmpty(items)) {
        return this.list || []
      }
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
      // if (/change$/.test(name))
      console.log("WnThAdaptor.__on_events", name, payload)

      // ByPass
      if (/^(indicate)$/.test(name)) {
        return () => ({ stop: false })
      }

      // Try routing
      let fn = _.get(this.EventRouting, name)
      if (!fn) {
        fn = this.$tiEventTryFallback(name, this.EventRouting)
      }

      // Handle without defined
      if (!fn) {
        return
      }



      const eval_func = (fn) => {
        let func;
        // Invoking string
        if (_.isString(fn)) {
          func = _.get(this, fn)
        }
        // Batch call
        if (_.isArray(fn)) {
          let calls = []
          for (let f of fn) {
            let callF = eval_func(f)
            if (_.isFunction(callF)) {
              calls.push(callF)
            }
          }
          if (!_.isEmpty(calls)) {
            return async () => {
              for (let callF of calls) {
                await callF(payload)
              }
            }
          }
        }
        // Object call
        if (!_.isFunction(func)) {
          // Prepare context
          let invokeContext = _.assign({
            $payload: payload
          }, this.GuiExplainContext)
          if (fn.explain) {
            fn = Ti.Util.explainObj(invokeContext, fn)
          }
          func = Ti.Util.genInvoking(fn, {
            context: invokeContext,
            dft: null,
            funcSet: this
          })
        }

        if (_.isFunction(func)) {
          if (!_.isUndefined(payload)) {
            return () => {
              func(payload)
            }
          }
          return func
        }
      }

      // callPath -> Function
      return eval_func(fn)
    },
    //--------------------------------------
    // __ti_shortcut(uniqKey) {      
    // }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  watch: {
    "contentLoadPath": function (newVal, oldVal) {
      if (newVal && !_.isEqual(newVal, oldVal)) {
        this.dispatch("loadContent")
      }
    }
  },
  ///////////////////////////////////////////
  created: function () {
  },
  ///////////////////////////////////////////
  mounted: async function () {
    // Update the customized actions
    let actions = this.thingActions
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