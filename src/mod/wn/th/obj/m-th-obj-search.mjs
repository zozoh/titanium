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
    // eval data home by <meta>
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
  async queryAggResult({ state, commit }, { aggName, flt = {}, dft = [] } = {}) {
    aggName = aggName || state.aggQuery
    if (!aggName) {
      return dft
    }
    state.LOG("async queryAggResult", aggName)
    let agg = _.get(state.agg, aggName)
    if (_.isEmpty(agg) || !agg.by) {
      state.LOG("!! Bad Agg Setting", agg)
      return
    }
    let ignore = Ti.AutoMatch.parse(agg.ignore)
    let {
      thingSetId,
      filter,
      fixedMatch,
    } = state
    // Query
    let qmeta = _.assign({}, filter, fixedMatch, flt);
    qmeta = _.omitBy(qmeta, (v, k) => {
      return ignore(k)
    })
    let input = JSON.stringify(qmeta)
    console.log(input)

    // Prepare the command
    commit("setStatus", { reloading: true })
    let cmdText = `o id:${thingSetId}/index @agg ${agg.by} -match -cqn`
    let reo = await Wn.Sys.exec2(cmdText, { input, as: "json" })

    // Update
    commit("setAggResult", { key: aggName, result: reo })
    // Done
    commit("setStatus", { reloading: false })
  },
  //----------------------------------------
  async queryList({ state, commit, dispatch, getters }, flt = {}) {
    state.LOG("async queryList")
    let {
      thingSetId,
      filter,
      fixedMatch,
      sorter,
      thingObjKeys
    } = state
    // Query
    let qmeta = _.assign({}, filter, fixedMatch, flt);
    let input = JSON.stringify(qmeta)

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