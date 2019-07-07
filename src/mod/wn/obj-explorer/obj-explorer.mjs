const SKEY_EXPOSE_HIDDEN = "wn-list-adaptview-expose-hidden"
//----------------------------------------------------
export default {
  ////////////////////////////////////////////
  getters : {
    //---------------------------------------------------
    currentItem(state) {
      if(state.currentId) {
        for(let it of state.list) {
          if(it.id == state.currentId) {
            return it
          }
        }
      }
      return null
    },
    //---------------------------------------------------
    selectedItems(state) {
      let list = []
      // Make the idsMap
      let idsMap = {}
      if(_.isArray(state.checkedIds)) {
        for(let id of state.checkedIds) {
          idsMap[id] = true
        }
      }
      for(let it of state.list) {
        if(idsMap[it.id]) {
          list.push(it)
        }
      }
      return list
    }
    //---------------------------------------------------
  },
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
        "currentId" : null,
        "checkedIds" : [],
        "uploadings" : [],
        "status" : {
          "publishing" : false,
          "reloading" : false,
          "deleting" : false,
          "exposeHidden" : false,
          "renaming" : false
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
      state.list = list
    },
    //---------------------------------------------------
    setCurrentId(state, id) {
      state.currentId = id || null
    },
    //---------------------------------------------------
    setCheckedIds(state, ids=[]) {
      state.checkedIds = ids
    },
    //---------------------------------------------------
    selectItem(state, id) {
      state.currentId = id
      state.checkedIds = []
      if(id) {
        state.checkedIds.push(id)
      }
    },
    //---------------------------------------------------
    removeItems(state, ids=[]) {
      // Find the current item index, and take as the next Item index
      let index = -1
      if(state.currentId) {
        for(let i=0; i<state.list.length; i++) {
          let it = state.list[i]
          if(it.id == state.currentId) {
            index = i
            break
          }
        }
      }
      // Make the idsMap
      let idsMap = {}
      for(let id of ids) {
        idsMap[id] = true
      }
      // Remove the ids
      let list2 = []
      for(let it of state.list) {
        if(!idsMap[it.id]) {
          list2.push(it)
        }
      }
      // Then get back the current
      index = Math.min(index, list2.length-1)
      let nextCurrent = null
      if(index >= 0) {
        nextCurrent = list2[index]
        state.currentId = nextCurrent.id
        state.checkedIds = [nextCurrent.id]
      }
      // No currentId
      else {
        state.currentId  = null
        state.checkedIds = []
      }
      // Reset the list
      state.list = list2
      if(state.pager) {
        state.pager.count = list2.length
        state.pager.sum = state.pager.pgsz * (state.pager.pgc-1) + list2.length
      }
      // console.log("the next current", nextCurrent)
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
    updateItemStatus(state, {id, status={}}={}) {
      if(_.isArray(state.list)) {
        for(let i=0; i<state.list.length; i++) {
          let child = state.list[i]
          if(child.id == id) {
            child.__is = child.__is || {}
            _.assign(child.__is, status)
            Vue.set(state.list, i, child)
            break;
          }
        }
      }
    },
    // //---------------------------------------------------
    // updateChild(state, it={}) {
    //   if(_.isArray(state.list)) {
    //     for(let i=0; i<state.list.length; i++) {
    //       let child = state.list[i]
    //       if(child.id == it.id) {
    //         let newIt = {__is:{}, ...it}
    //         if(state.currentId == it.id) {
    //           newIt.__is.selected = true
    //         }
    //         Vue.set(state.list, i, newIt)
    //         break;
    //       }
    //     }
    //   }
    // },
    //---------------------------------------------------
    appendToList(state, it) {
      if(it) {
        state.list = [].concat(state.list, it)
      }
    },
    //---------------------------------------------------
    prependToList(state, it) {
      if(it) {
        state.list = [].concat(it, state.list)
      }
    },
    //---------------------------------------------------
    toggleExposeHidden(state) {
      state.status.exposeHidden = !state.status.exposeHidden
      Ti.Storage.session.set(SKEY_EXPOSE_HIDDEN, state.status.exposeHidden)
    },
    //---------------------------------------------------
    recoverExposeHidden(state) {
      state.status.exposeHidden = Ti.Storage.session.getBoolean(SKEY_EXPOSE_HIDDEN)
    },
    //---------------------------------------------------
    addUploadings(state, ups) {
      state.uploadings = [].concat(state.uploadings, ups)
    },
    //---------------------------------------------------
    clearUploadings(state) {
      state.uploadings = []
    },
    //---------------------------------------------------
    updateUploadProgress(state, {uploadId, loaded=0}={}){
      for(let up of state.uploadings) {
        if(up.id == uploadId) {
          up.current = loaded
        }
      }
      state.uploadings = [...state.uploadings]
    }
  }
  ////////////////////////////////////////////
}