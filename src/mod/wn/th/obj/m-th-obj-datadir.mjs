////////////////////////////////////////////////
const _M = {
  //----------------------------------------
  //
  // Remove
  //
  //----------------------------------------
  async dfRemoveChecked({ state, commit, dispatch }, hard) {
    state.LOG("async dfRemoveChecked")
    // Guard
    if (!state.thingSetId) {
      return await Ti.Alert('State Has No ThingSetId', "warn")
    }

    let ids = _.cloneDeep(state.dataDirCheckedIds)
    if (!_.isArray(ids)) {
      ids = Ti.Util.truthyKeys(ids)
    }
    if (_.isEmpty(ids)) {
      return await Ti.Alert('i18n:del-none')
    }

    commit("setStatus", { deleting: true })

    // Prepare the cmds
    let cmd = ["o"]
    for (let id of ids) {
      cmd.push(`@get ${id}`)
    }
    cmd.push("@delete")
    let cmdText = cmd.join(" ")
    await Wn.Sys.exec2(cmdText)

    //console.log("getback current", current)
    // Update current
    await dispatch("selectDataFile")
    await dispatch("dfQueryFiles")

    commit("setStatus", { deleting: false })
  },
  //----------------------------------------
  //
  // Selection
  //
  //----------------------------------------
  selectDataFile({ commit }, {
    currentId = null, checkedIds = {}
  } = {}) {
    commit("setDataDirCurrentId", currentId)
    commit("setDataDirCheckedIds", checkedIds)
  },
  //----------------------------------------
  //
  // Query
  //
  //----------------------------------------
  async dfQueryFiles({ state, commit, getters }, flt = {}) {
    state.LOG("async dfQueryFiles")
    let {
      dataHome,
      dataDirName
    } = state
    // Command
    let aph = Ti.Util.appendPath(dataHome, dataDirName)
    let cmdText = `o ${aph} @query -pager -limit 1000 -sort 'nm:1' @json -cqnl`

    // Process Query
    commit("setStatus", { reloading: true })
    let reo = await Wn.Sys.exec2(cmdText, { as: "json" })

    state.LOG(" - ", cmdText, reo)

    // Update pager
    commit("setDataDirFiles", reo)
    commit("setCurrentMeta")

    commit("setStatus", { reloading: false })
    state.LOG(" - query done:", reo)
  },
  //--------------------------------------------
}
export default _M