const _M = {
  ////////////////////////////////////////////
  getters: {
    currentObj(state) {
      if(state.currentId) {
        let list = _.get(state.data, "list")
        return _.find(list, li => {
          return li.id == state.currentId
        })
      }
    }
  },
  ////////////////////////////////////////////
  mutations: {
    //----------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    //----------------------------------------
    setKeepSearch(state, keepSearch) {
      state.keepSearch = keepSearch
    },
    //----------------------------------------
    setPath(state, path) {
      state.path = path
    },
    //----------------------------------------
    setSearch(state, search) {
      state.search = _.cloneDeep(search)
    },
    //----------------------------------------
    setSearchMatch(state, match) {
      let search = _.cloneDeep(state.search)
      search.match = match || {}
      state.search = search
    },
    //----------------------------------------
    mergeSearchMatch(state, match) {
      let search = _.cloneDeep(state.search)
      _.merge(search.match, match)
      state.search = search
    },
    //----------------------------------------
    mergeSearchMatchOmitNil(state, match) {
      let search = _.cloneDeep(state.search)
      _.merge(search.match, match)
      search.match = _.omitBy(search.match, (val) => {
        return Ti.Util.isNil(val)
      })
      state.search = search
    },
    //----------------------------------------
    setFilter(state, filter) {
      state.filter = _.cloneDeep(filter)
    },
    //----------------------------------------
    setFilterBy(state, filterBy) {
      state.filterBy = filterBy
    },
    //----------------------------------------
    clearFilter(state) {
      let flt = _.cloneDeep(state.filter)
      flt.keyword = null
      flt.match = {}
      state.filter = flt
    },
    //----------------------------------------
    setCurrentId(state, currentId) {
      state.currentId = currentId
    },
    //----------------------------------------
    setSorter(state, sorter) {
      state.sorter = _.cloneDeep(sorter)
    },
    //----------------------------------------
    setPager(state, { pageNumber, pageSize } = {}) {
      if (_.isNumber(pageNumber)) {
        state.pageNumber = pageNumber
      }
      if (_.isNumber(pageSize)) {
        state.pageSize = pageSize
      }
    },
    //----------------------------------------
    setPageNumber(state, pageNumber = 1) {
      state.pageNumber = pageNumber
    },
    //----------------------------------------
    setPageSize(state, pageSize = 100) {
      state.pageSize = pageSize
    },
    //----------------------------------------
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    //----------------------------------------
    prependDateItem(state, newItem) {
      Ti.Util.UpsertStateDataItemAt(state, newItem, -1)
    },
    //----------------------------------------
    appendDateItem(state, newItem) {
      Ti.Util.UpsertStateDataItemAt(state, newItem, 1)
    },
    //----------------------------------------
    setDataItem(state, newItem) {
      Ti.Util.UpsertStateDataItemAt(state, newItem, 0)
    },
    //----------------------------------------
    mergeDataItem(state, theItem) {
      Ti.Util.MergeStateDataItem(state, theItem)
    },
    //----------------------------------------
    removeDataItems(state, items = []) {
      Ti.Util.RemoveStateDataItems(state, items)
    },
    //----------------------------------------
    setData(state, data) {
      state.data = data
    },
    //----------------------------------------
    setFieldStatus(state, { name, type, text } = {}) {
      if (name) {
        let ukey = _.concat(name).join("-")
        Vue.set(state.fieldStatus, ukey, { type, text })
      }
    },
    //----------------------------------------
    clearFieldStatus(state, names = []) {
      // Clean All
      if (_.isEmpty(names)) {
        state.fieldStatus = {}
      }
      // Clear one
      else {
        state.fieldStatus = _.omit(state.fieldStatus, names)
      }
    }
    //----------------------------------------
  }
  ////////////////////////////////////////////
}
export default _M;