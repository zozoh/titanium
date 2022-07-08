////////////////////////////////////////////////
const _M = {
  //----------------------------------------
  //
  // RecycelBin
  //
  //----------------------------------------
  async toggleInRecycleBin({ state, commit, dispatch }) {
    // Toggle filter
    let flt;
    if (-1 == _.get(state.filter, "th_live")) {
      flt = _.omit(state.filter, "th_live")
    } else {
      flt = _.assign({}, state.filter, { th_live: -1 })
    }
    commit("setFilter", flt)

    // Reload Search
    await dispatch("queryList")
  },
  //----------------------------------------
  async cleanRecycleBin({ state, commit, dispatch, getters }) {
    commit("setStatus", { cleaning: true })

    // Run command
    let th_set = state.thingSetId
    let cmdText = `thing ${th_set} clean -limit 3000`
    await Wn.Sys.exec2(cmdText)

    commit("setStatus", { cleaning: false })

    if (getters.isInRecycleBin) {
      await dispatch("queryList")
    }
  },
  //----------------------------------------
  async restoreRecycleBin({ state, commit, dispatch }) {
    // Require user to select some things at first
    let ids = state.checkedIds
    if (!_.isArray(ids)) {
      ids = Ti.Util.truthyKeys(ids)
    }
    if (_.isEmpty(ids)) {
      return await Ti.Alert('i18n:thing-restore-none')
    }
    commit("setStatus", { restoring: true })

    // Run command
    let th_set = state.thingSetId
    let cmdText = `thing ${th_set} restore -quiet -cqn -l ${ids.join(" ")}`
    await Wn.Sys.exec2(cmdText, { as: "json" })

    // Reload
    await dispatch("queryList")

    // Update current
    dispatch("selectMeta", { currentId: null, checkedIds: {} })

    commit("setStatus", { restoring: false })
  },
  //----------------------------------------
  //
  // Selection
  //
  //----------------------------------------
  async selectMeta({ state, commit, dispatch, getters }, {
    currentId = null, checkedIds = {}
  } = {}) {
    commit("setCurrentId", currentId)
    commit("setCheckedIds", checkedIds)
    commit("setCurrentMeta")
    commit("autoDataHome")
    // ? Load current content
    if (getters.contentLoadPath) {
      await dispatch("loadContent")
    }
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
  async queryList({ state, commit, getters }, flt = {}) {
    state.LOG("async queryList")
    let {
      thingSetId,
      filter,
      fixedMatch,
      sorter,
      thingObjKeys
    } = state
    // Query
    let input = JSON.stringify(_.assign({}, filter, fixedMatch, flt))

    // Command
    let cmds = [`thing ${thingSetId} query -cqn`]

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
    if (thingObjKeys) {
      cmds.push(`-e '${thingObjKeys}'`)
    }

    // Process Query
    let cmdText = cmds.join(" ")
    commit("setStatus", { reloading: true })
    let reo = await Wn.Sys.exec2(cmdText, { input, as: "json" })

    state.LOG(" - ", cmdText, input)

    // Update pager
    if (getters.isPagerEnabled) {
      commit("setPager", reo.pager)
    }
    commit("setList", reo.list)
    commit("setCurrentMeta")

    commit("setStatus", { reloading: false })
    state.LOG(" - query done:", reo)
  },
  //--------------------------------------------
}
export default _M