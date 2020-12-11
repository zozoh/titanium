function saveToLocal(meta, key, val) {
  if(!meta) {
    return
  }
  //console.log("saveToLocal", key, val)
  let local = Ti.Storage.session.getObject(meta.id) || {}
  _.defaults(local, {
    filter: {},
    sorter: {},
    pager: {}
  })
  local[key] = val
  Ti.Storage.session.setObject(meta.id, local)
}
//---------------------------------------
const _M = {
  ///////////////////////////////////////////////////////
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
    checkedItems(state) {
      // Make the idsMap
      let checkedMap = {}
      for(let id of state.checkedIds) {
        checkedMap[id] = true
      }
      // Join the items
      let list = []
      for(let it of state.list) {
        if(checkedMap[it.id]) {
          list.push(it)
        }
      }
      // done
      return list
    },
    //---------------------------------------------------
    isPagerEnabled(state) {
      return state.pager && state.pager.pn > 0 && state.pager.pgsz > 0
    },
    //---------------------------------------------------
    filterObj(state, getters, rootState) {
      let {keyword, match, majorKey, majorValue} = state.filter || {}
      let flt = {}
      //............................................
      // Eval Filter: keyword
      if(keyword) {
        if(/^[0-9a-z]{32}$/.test(keyword)) {
          flt.id = keyword
        }
        // Find
        else {
          let knm = "title"
          let beh = _.get(rootState, "main.config.schema.behavior") || {}
          let keys = _.keys(beh.keyword)
          //........................................
          for(let k of keys) {
            let val = beh.keyword[k]
            if(new RegExp(val).test(keyword)) {
              knm = k;
              break;
            }
          }
          //........................................
          // Accurate equal
          if(knm.startsWith("=")) {
            flt[knm.substring(1).trim()] = keyword
          }
          // Default is like
          else {
            flt[knm] = "^.*"+keyword;
          }
          //........................................
        }
      }
      //............................................
      // Eval Filter: match
      if(!_.isEmpty(match)) {
        _.assign(flt, match)
      }
      //............................................
      // Eval Filter: major
      if(majorKey && !Ti.Util.isNil(majorValue)) {
        _.set(flt, majorKey, majorValue)
      }
      //............................................
      // Fix filter
      let beMatch = _.get(rootState, "main.config.schema.behavior.match")
      if(!_.isEmpty(beMatch)) {
        _.assign(flt, beMatch)
      }
      //............................................
      // InRecycleBin 
      flt.th_live = state.inRecycleBin ? -1 : 1
      //............................................
      // Done
      return flt
    },
    //---------------------------------------------------
    filterStr(state, getters) {
      let flt = getters['filterObj']
      return _.isEmpty(flt)
        ? undefined
        : JSON.stringify(flt)
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  mutations : {
    setMeta(state, meta) {
      state.meta = meta
    },
    //---------------------------------------------------
    setStatus(state, status) {
      state.status = _.assign({}, state.status, status)
    },
    //---------------------------------------------------
    setFilter(state, filter={}) {
      //console.log("setFilter", JSON.stringify(filter))
      state.filter = filter
      saveToLocal(state.meta, "filter", state.filter)
    },
    updateFilter(state, flt={}) {
      //console.log("updateFilter", JSON.stringify(flt))
      state.filter = _.assign({}, state.filter, flt)
      saveToLocal(state.meta, "filter", state.filter)
    },
    setSorter(state, sorter) {
      state.sorter = sorter
      saveToLocal(state.meta, "sorter", state.sorter)
    },
    //---------------------------------------------------
    setPager(state, pager) {
      state.pager = pager
      saveToLocal(state.meta, "pager", state.pager)
    },
    updatePager(state, pg) {
      state.pager = _.defaults({}, pg, state.pager)
    },
    //---------------------------------------------------
    setInRecycleBin(state, inRecycleBin=false) {
      state.inRecycleBin = inRecycleBin
    },
    //---------------------------------------------------
    setList(state, list) {
      state.list = list
      state.count = _.size(list)
    },
    //---------------------------------------------------
    setCurrentId(state, id) {
      state.currentId = id || null
    },
    //---------------------------------------------------
    setShowKeys(state, showKeys) {
      state.showKeys = showKeys
    },
    //---------------------------------------------------
    setCheckedIds(state, ids=[]) {
      state.checkedIds = _.union(ids)
    },
    //---------------------------------------------------
    selectItem(state, id) {
      if(state.currentId != id) {
        state.currentId = id
        state.checkedIds = []
        if(id) {
          state.checkedIds.push(id)
        }
      }
    },
    //---------------------------------------------------
    removeItems(state, ids=[]) {
      // Find the current item index, and take as the next Item index
      //console.log("search.remove", ids)
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
      if(_.isArray(ids)) {
        for(let id of ids) {
          idsMap[id] = true
        }
      } else if (_.isPlainObject(ids)){
        idsMap = ids
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
          list.push({...it, __updated_time:Date.now()})
        } else {
          list.push(li)
        }
      }
      state.list = list
    },
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
    }
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}
export default _M;