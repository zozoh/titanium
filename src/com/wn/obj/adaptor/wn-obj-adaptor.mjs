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
      let routing = {
        "block:shown": "updateBlockShown",
        "block:show": "showBlock",
        "block:hide": "hideBlock",
        "meta::field:change": "OnMetaFieldChange",
        "content::change": "OnContentChange",
        "save:change": "OnSaveChange",
        "search::list::select": "OnSearchListSelect",
        "filter::filter:change": "OnSearchFilterChange",
        "filter::sorter:change": "OnSearchSorterChange",
        "pager::change": "OnSearchPagerChange"
      }

      // Define the expend function
      const expendEvent = (v, k) => {
        let old = routing[k]
        if (!old) {
          routing[k] = v
          return
        }
        // Array to join
        if (_.isArray(v)) {
          routing[k] = _.concat(old, v)
        }
        // Another to replace
        else {
          routing[k] = v
        }
      }

      // Expend from prop
      _.forEach(this.events, expendEvent)

      // Expend from schema
      _.forEach(_.get(this.schema, "events"), expendEvent)

      // Then done
      return routing
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
    async OnMetaFieldChange(payload) {
      //console.log("OnMetaFieldChange", payload)
      await this.dispatch("updateMetaField", payload)
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
      //console.log("WnObjAdaptor.updateBlockShow", shown)
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
      // ByPass
      if (/^(indicate)$/.test(name)) {
        return () => ({ stop: false })
      }
      //if (/select$/.test(name)) {
      console.log("WnObjAdaptor.__on_events", name, payload)
      //}

      // Try routing
      let fns = _.get(this.EventRouting, name)
      if (!fns) {
        fns = this.$tiEventTryFallback(name, this.EventRouting)
      }
      let fnList = _.without(_.concat(fns), undefined, null)

      // callPath -> Function
      let funcList = [];
      for (let fn of fnList) {
        // Direct call
        if (_.isFunction(fn)) {
          funcList.push(fn)
        }
        // Gen invoking
        else if (_.isString(fn)) {
          let func = _.get(this, fn)
          if (!_.isFunction(func)) {
            func = Ti.Util.genInvoking(fns, {
              context: this.GuiExplainContext,
              dft: null,
              funcSet: this
            })
          }
          if (_.isFunction(func)) {
            funcList.push(func)
          }
        }
      }

      // Return for invoke
      if (!_.isEmpty(funcList)) {
        if (!_.isUndefined(payload)) {
          return () => {
            for (let func of funcList) {
              func.apply(this, [payload])
            }
          }
        }
        if (funcList.length > 1) {
          return () => {
            for (let func of funcList) {
              func.apply(this)
            }
          }
        }
        return funcList[0]
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
    let actions = this.objActions || null
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