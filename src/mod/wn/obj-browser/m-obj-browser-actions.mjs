////////////////////////////////////////////
function getKeepSearchAs(state) {
  if(state.meta && state.keepSearch) {
    return `browser-search-${state.meta.id}`
  }
}
////////////////////////////////////////////
const _M = {
  //----------------------------------------
  saveSearchSetting({state, commit}, {filter, sorter, pager}={}) {
    if(filter) {
      commit("setFilter", filter)
    }
    if(sorter) {
      commit("setSorter", sorter)
    }
    if(pager) {
      commit("setPager", pager)
    }

    let keepAs = getKeepSearchAs(state)
    if(keepAs) {
      Ti.Storage.session.setObject(keepAs, {
        filter : state.filter,
        sorter : state.sorter,
        pager  : {
          pageNumber : state.pageNumber,
          pageSize   : state.pageSize
        }
      })
    }
  },
  //----------------------------------------
  recoverSearchSetting({state, commit}) {
    let keepAs = getKeepSearchAs(state)
    if(keepAs) {
      let {
        filter, sorter, pager
      } = Ti.Storage.session.getObject(keepAs, {})
      pager = _.assign({}, {
        pageNumber : state.pageNumber || 1,
        pageSize   : state.pageSize   || 1000
      }, pager)
      if(filter) {
        commit("setFilter", filter)
      }
      if(sorter) {
        commit("setSorter", sorter)
      }
      if(pager) {
        commit("setPager", pager)
      }
    }
  },
  //----------------------------------------
  async query({dispatch}, search={}){
    //console.log("browser query", search)
    dispatch("saveSearchSetting", search)
    return await dispatch("reloadData")
  },
  //----------------------------------------
  async reloadData({state, commit, dispatch}) {
    if(state.status.reloading) {
      return
    }
    //......................................
    // Init content as null
    commit("setStatus", {reloading:true})
    //......................................
    let cmds = ['o']
    if(state.path) {
      cmds.push(`'${state.path}'`)
    }
    cmds.push('@query -pager -mine -hidden')
    //
    // Setup pager
    //
    if(state.pageSize > 0) {
      let pgsz = state.pageSize
      let pn = state.pageNumber || 1
      let skip = Math.max(0, pgsz * (pn-1))
      if(skip > 0) {
        cmds.push(`-skip ${skip}`)
      }
      cmds.push(`-limit ${pgsz}`)
    }
    //
    // Setup sort
    //
    if(state.sorter) {
      cmds.push(`-sort '${JSON.stringify(state.sorter)}'`)
    }
    //
    // Query 
    //
    let input;
    if(state.search) {
      let flt = Wn.Util.getMatchByFilter(state.filter, state.search)
      // Empty filter, force update it again
      if(_.isEmpty(flt)) {
        commit("clearFilter")
        dispatch("saveSearchSetting", {filter:state.filter})
      }
      //console.log("customized filter", flt)
      // Customized filter
      let filterBy = Ti.Util.explainObj(state, state.filterBy)
      if (_.isFunction(filterBy)) {
        flt = filterBy({ state }, flt) || flt
      }
      input = JSON.stringify(flt)
    }
    cmds.push('@json -cqnl')
    let data = await Wn.Sys.exec2(cmds.join(' '), {as:"json", input})
    commit("setData", data)
    //......................................
    // Just update the meta   
    commit("setStatus", {reloading:false})
  },
  //----------------------------------------
  async reloadSettings({state,commit}) {
    commit("setStatus", {reloading:true})
    let config = await Wn.Io.loadContent(state.meta, {as:"json"})
    commit("setStatus", {reloading:false})
    //
    // Commit to state
    //
    commit("setKeepSearch", Ti.Util.fallback(
      config.keepSearch, state.keepSearch, true))
    commit("setSearch", Ti.Util.fallback(config.search, state.search, {}))
    commit("setFilter", Ti.Util.fallback(config.filter, state.filter, {}))
    commit("setFilterBy", Ti.Util.fallback(config.filterBy, state.filterBy))
    commit("setSorter", Ti.Util.fallback(config.sorter, state.sorter, {nm:1}))
    commit("setPageNumber", Ti.Util.fallback(config.pageNumber, state.pageNumber, 1))
    commit("setPageSize", Ti.Util.fallback(config.pageSize, state.pageSize, 1000))
  },
  //----------------------------------------
  async reload({state, commit, dispatch}, meta) {
    if(state.status.reloading
      || state.status.saving){
      return
    }
    //......................................
    // Use the default meta
    if(_.isUndefined(meta)) {
      meta = state.meta
    }
    //......................................
    if(_.isString(meta)) {
      meta = await Wn.Io.loadMeta(meta)
    }
    else if(meta && meta.id) {
      meta = await Wn.Io.loadMetaById(meta.id)
    }
    //......................................
    // Guard
    if(!meta) {
      commit("setMeta", null)
    }
    // Save current meta as config object
    commit("setMeta", meta)
    //console.log("m-obj-current.reload", meta.id)
    //......................................
    // Reload the config
    await dispatch("reloadSettings")

    // Reload from local
    dispatch("recoverSearchSetting")

    // Reload data
    await dispatch("reloadData")
    //......................................
    // Just update the meta   
    commit("setStatus", {reloading:false})
  }
  //----------------------------------------
}
export default _M;