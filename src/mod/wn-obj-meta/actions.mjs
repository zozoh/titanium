// Ti required(Wn)
//---------------------------------------
export default {
  /***
   * Get obj by ID
   */
  async loadMetaById({state, commit}, id) {
    // If wihtout ID reset
    if(!id) {
      commit("reset")
    }
    // Load from server
    else {
      let meta = await Wn.Io.loadMetaById(id)
      commit("set", {meta})
    }
  },
  /***
   * Get obj meta by path string
   */
  async loadMeta({state, commit}, str){
    // If wihtout ID reset
    if(!str) {
      commit("reset")
    }
    // Load from server
    else {
      let meta = await Wn.Io.loadMeta(str)
      commit("set", {meta})
    }
  },
  /***
   * Get obj ancestors by meta
   */
  async loadAncestors({state, commit}, meta=state.meta) {
    let ancestors = await Wn.Io.loadAncestors("id:"+meta.id)
    let parent = _.last(ancestors)
    commit("set", {
      meta, parent, ancestors
    })
  },
    /***
   * Load obj meta/ancestors/children/content
   */
  async reload({state, dispatch}, str) {
    await dispatch("loadMeta", str)
    await dispatch("loadAncestors")
  }
}