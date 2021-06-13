//----------------------------------------
function UpsertDataItemAt(state, newItem, atPos=1) {
  // Guard
  if(_.isEmpty(newItem) || !newItem || !newItem.id) {
    return
  }
  // Batch upsert
  if(_.isArray(newItem)) {
    for(let it of newItem) {
      UpsertDataItemAt(state, it, atTail)
    }
    return
  }
  // upsert one
  let data = state.data
  // Update pager list item of data
  if(_.isArray(data.list) && data.pager) {
    let list = _.cloneDeep(data.list)
    let list2 = []
    let found = false
    for(let li of list) {
      if(!found && (li.id == newItem.id || li.nm == newItem.nm)) {
        list2.push(newItem)
        found = true
      } else {
        list2.push(li)
      }
    }
    if(!found) {
      if(atPos>0) {
        list2.push(newItem)
      } else if (atPos<0){
        list2 = _.concat(newItem, list2)
      }
    }
    state.data = {
      list: list2,
      pager : data.pager
    }
  }
  // Just insert
  else {
    state.data = {
      list: newItems,
      pager : data.pager
    }
  }
}
//////////////////////////////////////////////
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
      UpsertDataItemAt(state, newItem, -1)
    },
    //----------------------------------------
    appendDateItem(state, newItem) {
      UpsertDataItemAt(state, newItem, 1)
    },
    //----------------------------------------
    setDataItem(state, newItem) {
      UpsertDataItemAt(state, newItem, 0)
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