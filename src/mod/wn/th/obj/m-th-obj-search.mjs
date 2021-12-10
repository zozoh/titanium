////////////////////////////////////////////////
const _M = {
  //----------------------------------------
  async applyFilter({ commit, getters, dispatch }, filter) {
    //console.log("applyFilter", filter)
    commit("setFilter", filter)
    // If pager enabled, should auto jump to first page
    if (getters.isPagerEnabled) {
      commit("assignPager", { pn: 1 })
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
  async applyPager({commit, dispatch}, pager) {
    //console.log("applyPager", pager)
    commit("assignPager", pager)
    await dispatch("queryList")
  },
  //----------------------------------------
  async selectMeta({commit}, {currentId, checkedIds}) {
    commit("setCurrentId", currentId)
    commit("setCheckedIds", checkedIds)
    commit("setCurrentMeta")

    // ? Load current content

    // ? Load current data dir
  },
  //----------------------------------------
  async queryList({ state, commit, getters }) {
    let {
      thingSetId,
      filter,
      fixedMatch,
      sorter,
      thingObjKeys
    } = state
    // Query
    let input = JSON.stringify(_.assign({}, filter, fixedMatch))

    // Command
    let cmds = [`thing ${thingSetId} query -cqn`]

    // Eval Pager
    if (getters.isPagerEnabled) {
      let limit = state.pager.pgsz * 1
      let skip = state.pager.pgsz * (state.pager.pn - 1)
      cmds.push(`-pager -limit ${limit} -skip ${skip}`)
    }

    // Sorter
    if (!_.isEmpty(sorter)) {
      cmds.push(`-sort '${JSON.stringify(sorter)}'`)
    }

    // Show Thing Keys
    if (thingObjKeys) {
      cmds.push(`-e '${thingObjKeys}'`)
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