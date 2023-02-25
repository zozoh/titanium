const _M = {
  ///////////////////////////////////////////////////////
  data: () => ({
    myFilterValue: null,
    myOptionsData: [],
    can: {
      data: [],
      checkedIds: []
    },
    sel: {
      data: [],
      checkedIds: []
    },
    selIdMap: {},
    loading: true
  }),
  ///////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    },
    //------------------------------------------------
    Values() {
      return Ti.S.toArray(this.value)
    },
    //------------------------------------------------
    CanListComType() { return this.canComType || "ti-list" },
    SelListComType() { return this.selComType || "ti-list" },
    //------------------------------------------------
    CanListComConf() {
      return this.genComConf(this.canComConf, this.can)
    },
    SelListComConf() {
      return this.genComConf(this.selComConf, this.sel)
    },
    //------------------------------------------------
    SelActions() {
      return {
        items: [{
          name: "moveUp",
          type: "action",
          icon: "zmdi-long-arrow-up",
          action: () => {
            this.selMoveUp()
          }
        }, {
          name: "moveDown",
          type: "action",
          icon: "zmdi-long-arrow-down",
          action: () => {
            this.selMoveDown()
          }
        }]
      }
    },
    //------------------------------------------------
    FilterComConf() {
      return _.assign({
        trimed: true,
        width: "100%",
        prefixIcon: this.loading
          ? "fas-spinner fa-spin"
          : "zmdi-filter-list",
        placeholder: "i18n:filter",
        hover: ['prefixIcon', 'suffixText', 'suffixIcon'],
        loading: this.loading
      }, this.fltComConf)
    },
    //------------------------------------------------
    GetValueBy() {
      return it => this.Dict.getValue(it)
    },
    //------------------------------------------------
    ReverMapping() {
      if (this.mapping) {
        Ti.Util.reverMapping(this.mapping)
      }
    },
    //------------------------------------------------
    Dict() {
      // Customized
      if (this.options instanceof Ti.Dict) {
        return this.options
      }
      // Refer dict
      if (_.isString(this.options)) {
        let dictName = Ti.DictFactory.DictReferName(this.options)
        if (dictName) {
          return Ti.DictFactory.CheckDict(dictName)
        }
      }
      let query;
      if (_.isFunction(this.options)) {
        query = this.options
      }
      // Auto Create
      return Ti.DictFactory.CreateDict({
        data: this.options,
        query,
        getValue: Ti.Util.genGetter(this.valueBy || "value"),
        getText: Ti.Util.genGetter(this.textBy || "text|name"),
        getIcon: Ti.Util.genGetter(this.textBy || "icon")
      })
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods: {
    //---------------------------------------------------
    OnCanListSelected({ checkedIds }) {
      this.can.checkedIds = Ti.Util.truthyKeys(checkedIds)
    },
    //---------------------------------------------------
    OnSelListSelected({ checkedIds }) {
      this.sel.checkedIds = Ti.Util.truthyKeys(checkedIds)
    },
    //---------------------------------------------------
    OnClickHeadChecker(list) {
      let { data, checkedIds } = list
      // All -> none
      if (data.length == checkedIds.length) {
        list.checkedIds = []
      }
      // Others to All
      else {
        let idMap = this.rebuildIdMap(data)
        list.checkedIds = Ti.Util.truthyKeys(idMap)
      }
    },
    //---------------------------------------------------
    async OnFilterChanged(val) {
      //console.log("OnFilterChanged", val)
      this.myFilterValue = val
      this.myOptionsData = await this.Dict.queryData(val)
      this.evalShownCanList()
    },
    //---------------------------------------------------
    GetHeadCheckerIcon({ data, checkedIds }) {
      if (data.length > 0) {
        // All
        if (data.length == checkedIds.length) {
          return "fas-check-square"
        }
        // Partally
        if (checkedIds.length > 0) {
          return "fas-minus-square"
        }
      }
      return "far-square" // none
    },
    //---------------------------------------------------
    // Core Methods
    //---------------------------------------------------
    canListToSel() {
      // Guard
      if (_.isEmpty(this.can.checkedIds))
        return
      // Assign
      let { src, tag } = this.assignToList(this.can, this.sel)
      this.can = src
      this.sel = tag
    },
    //---------------------------------------------------
    selListToCan() {
      // Guard
      if (_.isEmpty(this.sel.checkedIds))
        return
      // Assign
      let { src, tag } = this.assignToList(this.sel, this.can)
      this.can = tag
      this.sel = src
    },
    //---------------------------------------------------
    selMoveUp() {
      let {
        remains, checks, minIndex, maxIndex, checkedIds
      } = this.evalTheList(this.sel)
      if (!_.isEmpty(checks) && minIndex > 0) {
        Ti.Util.insertToArray(remains, minIndex - 1, ...checks)
        this.sel = {
          data: remains,
          checkedIds
        }
      }
    },
    //---------------------------------------------------
    selMoveDown() {
      let {
        remains, checks, minIndex, maxIndex, checkedIds
      } = this.evalTheList(this.sel)
      if (!_.isEmpty(checks)) {
        if (maxIndex < remains.length) {
          maxIndex++
        }
        Ti.Util.insertToArray(remains, maxIndex, ...checks)
        this.sel = {
          data: remains,
          checkedIds
        }
      }
    },
    //---------------------------------------------------
    // Utility
    //---------------------------------------------------
    // Eval the can/sel List 
    evalTheList(list = {}) {
      let remains = []
      let checks = []
      let checkedIds = []
      let idMap = {}
      let minIndex = list.data.length
      let maxIndex = -1
      // Build ID map
      _.forEach(list.checkedIds, id => {
        idMap[id] = true
      })
      // Eval checked and remains
      _.forEach(list.data, (li, index) => {
        let id = this.GetValueBy(li)
        if (idMap[id]) {
          minIndex = Math.min(index, minIndex)
          maxIndex = Math.max(index, maxIndex)
          checkedIds.push(id)
          checks.push(li)
        } else {
          remains.push(li)
        }
      })
      // Done for eval
      return {
        remains, checks,
        minIndex,
        maxIndex: maxIndex - checks.length + 1,
        checkedIds
      }
    },
    //---------------------------------------------------
    assignToList({ data, checkedIds }, ta) {
      // Make ids map
      let ids = {}
      _.forEach(checkedIds, v => ids[v] = true)
      // pick remove list
      let remains = []
      let joins = []
      _.forEach(data, it => {
        let itV = this.Dict.getValue(it)
        if (ids[itV]) {
          joins.push(it)
        } else {
          remains.push(it)
        }
      })
      // Merge checked ids
      _.forEach(ta.checkedIds, v => ids[v] = true)
      // Join to new list
      return {
        src: {
          data: remains, checkedIds: []
        },
        tag: {
          data: _.concat(ta.data, joins),
          checkedIds: []
        }
      }
    },
    //---------------------------------------------------
    genComConf(comConf, { data, checkedIds }) {
      return _.assign({
        idBy: this.GetValueBy,
        display: this.display || "text"
      }, comConf, {
        data, checkedIds,
        multi: true,
        checkable: true,
        puppetMode: true,
        autoCheckCurrent: false,
      })
    },
    //---------------------------------------------------
    evalShownCanList() {
      let list = []
      _.forEach(this.myOptionsData, it => {
        let itV = this.Dict.getValue(it)
        console.log(itV)
        if (!this.selIdMap[itV]) {
          list.push(it)
        }
      })
      this.can.data = list
      this.can.checkedIds = []
    },
    //---------------------------------------------------
    async reloadCanList() {
      //console.log("reloadCanList")
      this.loading = true
      this.myOptionsData = await this.Dict.queryData(this.myFilterValue)
      this.evalShownCanList()
      this.loading = false
    },
    //---------------------------------------------------
    async reloadSelList(vals = this.Values) {
      //console.log("reloadSelList")
      this.loading = true
      let list = []
      for (let val of vals) {
        let v = this.evalValue(val)
        let it = await this.Dict.getItem(v)
        if (it) {
          list.push(it)
        } else {
          list.push(v)
        }
      }
      this.sel = {
        data: list,
        checkedIds: _.get(this.sel, "checkedIds") || []
      }
      this.loading = false
    },
    //---------------------------------------------------
    rebuildIdMap(data) {
      let ids = {}
      _.forEach(data, it => {
        let itV = this.Dict.getValue(it)
        ids[itV] = true
      })
      return ids
    },
    //---------------------------------------------------
    rebuildSelIdMap() {
      this.selIdMap = this.rebuildIdMap(this.sel.data)
    },
    //---------------------------------------------------
    evalValue(val) {
      // Guard
      if (Ti.Util.isNil(val)) {
        return val
      }
      // Cases
      return ({
        id: v => v,
        obj: v => {
          if (this.ReverMapping) {
            v = Ti.Util.translate(v, this.ReverMapping)
          }
          return _.get(v, this.idBy)
        },
        item: v => {
          if (this.ReverMapping) {
            v = Ti.Util.translate(v, this.ReverMapping)
          }
          return _.get(v, "value")
        }
      })[this.valueType](val)
    },
    //---------------------------------------------------
    async genValue() {
      let ids = _.keys(this.selIdMap)
      // Guard
      if (_.isEmpty(ids))
        return []
      // Parse
      return await ({
        id: ids => {
          return ids
        },
        obj: async ids => {
          let list = []
          for (let id of ids) {
            let it = await this.Dict.getItem(id)
            if (it)
              if (this.mapping) {
                it = Ti.Util.translate(it, this.mapping)
              }
            list.push(it)
          }
          return list
        },
        item: async ids => {
          let list = []
          for (let id of ids) {
            let obj = await this.Dict.getItem(id)
            let it = {
              text: this.Dict.getText(obj),
              value: this.Dict.getValue(obj)
            }
            if (it) {
              if (this.mapping) {
                it = Ti.Util.translate(it, this.mapping)
              }
              list.push(it)
            }
          }
          return list
        }
      })[this.valueType](ids)
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch: {
    "value": function (newVal, oldVal) {
      if (!_.isEqual(newVal, oldVal)) {
        this.reloadSelList()
      }
    },
    "options": function (newVal, oldVal) {
      if (!_.isEqual(newVal, oldVal)) {
        this.reloadCanList()
      }
    },
    "sel.data": async function () {
      this.rebuildSelIdMap()
      let val = await this.genValue()
      if (this.changeEventName && !_.isEqual(val, this.Values)) {
        this.$notify(this.changeEventName, val)
      }
    }
  },
  ///////////////////////////////////////////////////////
  mounted: async function () {
    await this.reloadSelList()
    await this.reloadCanList()
  }
  ///////////////////////////////////////////////////////
}
export default _M;