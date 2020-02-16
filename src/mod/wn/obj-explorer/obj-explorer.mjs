export default {
  ////////////////////////////////////////////
  mutations : {
    //---------------------------------------------------
    reset(state) {
      _.assign(state, {
        "meta": null,
        "filter" : {},
        "sorter" : {
          "ct" : -1
        },
        "pager" : {
          "pn"   : 1,
          "pgsz" : 50,
          "pgc"  : 0,
          "sum"  : 0,
          "skip" : 0,
          "count": 0
        },
        "list" : [],
        "status" : {
          "reloading" : false,
          "exposeHidden" : false
        }
      })
    },
    //---------------------------------------------------
    setMeta(state, meta) {
      state.meta = meta
    },
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    setFilter(state, filter={}) {
      state.filter = filter
    },
    updateFilter(state, flt={}) {
      //console.log("updateFilter", JSON.stringify(flt))
      state.filter = _.assign({}, state.filter, flt)
    },
    setSorter(state, sorter) {
      state.sorter = sorter
    },
    setPager(state, pager) {
      state.pager = pager
    },
    updatePager(state, pg) {
      state.pager = _.assign({}, state.pager, pg)
    },
    setList(state, list) {
      if(_.isArray(list)) {
        state.list = _.concat(list)
      }
    },
    //---------------------------------------------------
    updateItem(state, it) {
      let list = []
      for(let li of state.list) {
        if(li.id == it.id) {
          list.push(it)
        } else {
          list.push(li)
        }
      }
      state.list = list
    },
    //---------------------------------------------------
    setExposeHidden(state, exposeHidden) {
      state.status.exposeHidden = exposeHidden
    }
  }
  ////////////////////////////////////////////
}