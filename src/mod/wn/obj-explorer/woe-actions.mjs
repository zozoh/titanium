// Ti required(Wn)
//---------------------------------------
export default {
  /***
   * Get obj children by meta
   */
  async loadChildren({state, commit}, {
    meta, skip, limit, sort, mine, match
  }) {
    if('DIR' != meta.race) {
      commit("set", null)
      return
    }
    let re = await Wn.Io.loadChildren(meta, {
      skip, limit, sort, mine, match})
    commit("set", {
      children : re.list,
      pager    : re.pager
    })
    return re
  },
  /**
   * Upload files
   */
  async upload({state, commit, dispath}, files) {
    console.log("uploadFiles", files)
  },
  /***
   * Reload all
   */
  async reload({state, commit, dispatch}, meta) {
    // Use the default meta
    if(!meta) {
      meta = state.meta
    }
    // Update the current meta
    else {
      commit("set", {meta})
    }
    // Load children
    await dispatch("loadChildren", {meta})
    // return the root state
    return state
  }
}