const _M = {
  ////////////////////////////////////////////
  mutations : {
    //----------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    //----------------------------------------
    setKeepSearch(state, keepSearch) {
      state.keepSearch = keepSearch
    },
    //----------------------------------------
    setSearch(state, search) {
      state.search = _.cloneDeep(search)
    },
    //----------------------------------------
    setFilter(state, filter) {
      state.filter = _.cloneDeep(filter)
    },
    //----------------------------------------
    clearFilter(state) {
      let flt = _.cloneDeep(state.filter)
      flt.keyword = null
      flt.match = {}
      state.filter = flt
    },
    //----------------------------------------
    setSorter(state, sorter) {
      state.sorter = _.cloneDeep(sorter)
    },
    //----------------------------------------
    setPager(state, {pageNumber, pageSize}={}) {
      if(_.isNumber(pageNumber)) {
        state.pageNumber =  pageNumber
      }
      if(_.isNumber(pageSize)) {
        state.pageSize =  pageSize
      }
    },
    //----------------------------------------
    setPageNumber(state, pageNumber=1) {
      state.pageNumber =  pageNumber
    },
    //----------------------------------------
    setPageSize(state, pageSize=100) {
      state.pageSize =  pageSize
    },
    //----------------------------------------
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    //----------------------------------------
    prependDateItem(state, newItem) {
      if(_.isEmpty(newItem))
        return
      let data = state.data
      let list = _.cloneDeep(data.list) || []
      let pager = data.pager
      list = _.concat(newItem, list)
      state.data = {
        list, pager
      }
    },
    //----------------------------------------
    appendDateItem(state, newItem) {
      if(_.isEmpty(newItem))
        return
      let data = state.data
      let list = _.cloneDeep(data.list) || []
      let pager = data.pager
      list = _.concat(list, newItem)
      state.data = {
        list, pager
      }
    },
    //----------------------------------------
    setDataItem(state, newItem) {
      // console.log("setDataItem:", newItem)
      // Guard
      if(!newItem || !newItem.id)
        return

      let data = state.data

      // Update pager list item of data
      if(_.isArray(data.list) && data.pager) {
        let list = _.cloneDeep(data.list)
        list = _.map(list, li => {
          if(li.id == newItem.id) {
            return newItem
          }
          return li
        })
        state.data = {
          list,
          pager : data.pager
        }
      }
    },
    //----------------------------------------
    setData(state, data) {
      state.data = data
    }
    //----------------------------------------
  }
  ////////////////////////////////////////////
}
export default _M;