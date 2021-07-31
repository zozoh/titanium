// Ti required(Wn)
////////////////////////////////////////////////
export default {
  //--------------------------------------------
  async reloadPage({ state, commit, dispatch }, pg) {
    commit("updatePager", pg)
    await dispatch("reload")
  },
  //--------------------------------------------
  async reload({ state, commit, getters }, meta) {
    //............................................
    // Update New Meta
    if (meta) {
      commit("setMeta", meta)
    }
    // Get meta back
    else {
      meta = state.meta
    }
    //............................................
    // Mark reloading
    commit("setStatus", { reloading: true })
    //............................................
    let cmds = [`thing id:${meta.id} query -cqn`]
    //............................................
    // Eval Sorter
    if (!_.isEmpty(state.sorter)) {
      let sort = JSON.stringify(state.sorter)
      cmds.push(`-sort '${sort}'`)
    }
    //............................................
    // Eval Pager
    if (getters.isPagerEnabled) {
      let limit = state.pager.pgsz
      let skip = state.pager.pgsz * (state.pager.pn - 1)
      cmds.push(' -pager')
      cmds.push(`-limit ${limit}`)
      cmds.push(`-skip  ${skip}`)
    }

    //............................................
    // Eval Showkeys
    if (state.showKeys) {
      cmds.push(` -e '${state.showKeys}'`)
    }

    //............................................
    // Run Command
    let input = getters.filterStr
    let cmdText = cmds.join(" ")
    let reo = await Wn.Sys.exec2(cmdText, { input, as: "json" })
    //............................................
    // All done
    if (getters.isPagerEnabled) {
      commit("setPager", reo.pager)
      commit("setList", reo.list)
    } else {
      commit("setList", reo)
    }
    commit("setStatus", { reloading: false })
  }
  //--------------------------------------------
}