////////////////////////////////////////////////
const _M = {
  //----------------------------------------
  //
  // Selection
  //
  //----------------------------------------
  async selectMeta({ state, commit, dispatch, getters }, {
    currentId = null, checkedIds = {}
  } = {}) {
    state.LOG("selectMeta", currentId, checkedIds)
    // If current is nil but we got the chekced 
    // just pick one as the meta
    if (!currentId && !_.isEmpty(checkedIds)) {
      currentId = _.first(Ti.Util.truthyKeys(checkedIds))
    }
    else if (currentId && _.isEmpty(checkedIds)) {
      checkedIds = [currentId]
    }
    commit("setCurrentId", currentId)
    commit("setCheckedIds", checkedIds)
    // find <meta> by currentId from <list>
    commit("setCurrentMeta")
    // ? Load current content
    if (getters.contentLoadPath) {
      await dispatch("loadContent")
    }
  },
  //----------------------------------------
  //
  // Filter / Sorter / Pager
  //
  //----------------------------------------
  async applyFilter({ commit, getters, dispatch }, filter) {
    //console.log("applyFilter", filter)
    commit("setFilter", filter)
    // If pager enabled, should auto jump to first page
    if (getters.isPagerEnabled) {
      let pnKey = getters.isLongPager ? "pageNumber" : "pn"
      commit("assignPager", { [pnKey]: 1 })
    }
    await dispatch("queryList")
  },
  //----------------------------------------
  async applySorter({ commit, dispatch }, sorter) {
    //console.log("applySorter", sorter)
    commit("setSorter", sorter)
    await dispatch("queryList")
  },
  //----------------------------------------
  async applyPager({ commit, dispatch }, pager) {
    //console.log("applyPager", pager)
    commit("assignPager", pager)
    await dispatch("queryList")
  },
  //----------------------------------------
  //
  // Query
  //
  //----------------------------------------
  async queryList({ state, commit, getters, rootState }) {
    let {
      dirId,
      filter,
      fixedMatch,
      sorter,
      objKeys
    } = state
    // Query
    let input = JSON.stringify(_.assign({}, filter, fixedMatch))
    let exposeHidden = _.get(rootState, "viewport.exposeHidden")

    // Command
    let cmds = [`o 'id:${dirId}' @query`]

    if(exposeHidden){
      cmds.push('-hidden')
    }

    // Eval Pager
    if (getters.isPagerEnabled) {
      let limit = getters.searchPageSize * 1
      let skip = getters.searchPageSize * (getters.searchPageNumber - 1)
      cmds.push(`-pager -limit ${limit} -skip ${skip}`)
    }


    // Sorter
    if (!_.isEmpty(sorter)) {
      cmds.push(`-sort '${JSON.stringify(sorter)}'`)
    }

    // Show Thing Keys
    if (objKeys) {
      cmds.push(`@json '${objKeys}' -cqnl`)
    }
    // Output as json
    else {
      cmds.push('@json -cqnl')
    }

    // Process Query
    let cmdText = cmds.join(" ")
    commit("setStatus", { reloading: true })
    let reo = await Wn.Sys.exec2(cmdText, { input, as: "json" })

    // Update pager
    if (getters.isPagerEnabled) {
      commit("setPager", reo.pager)
    }
    commit("setList", reo.list)
    commit("setCurrentMeta")

    commit("setStatus", { reloading: false })
  },
  //--------------------------------------------
}
export default _M