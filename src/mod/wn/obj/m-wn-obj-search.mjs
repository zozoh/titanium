////////////////////////////////////////////////
const _M = {
  //----------------------------------------
  //
  // Selection
  //
  //----------------------------------------
  async selectMeta({ commit }, { currentId = null, checkedIds = {} } = null) {
    commit("setCurrentId", currentId)
    commit("setCheckedIds", checkedIds)
    commit("setCurrentMeta")
    // ? Load current content

    // ? Load current data dir
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
    console.log("applyPager", pager)
    commit("assignPager", pager)
    await dispatch("queryList")
  },
  //----------------------------------------
  //
  // Query
  //
  //----------------------------------------
  async queryList({ state, commit, getters }) {
    let {
      dirId,
      filter,
      fixedMatch,
      sorter,
      objKeys
    } = state
    // Query
    let input = JSON.stringify(_.assign({}, filter, fixedMatch))

    // Command
    let cmds = [`o 'id:${dirId}' @query`]

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
    console.log(cmdText)
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