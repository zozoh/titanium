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
   * 
   * @param str{String|Object} : string as the path,
   *        object is the meta
   */
  async reload({state, dispatch}, str) {
    if(_.isString(str)) {
      await dispatch("loadMeta", str)
      await dispatch("loadAncestors")
    }
    // Object as the meta object
    else if(_.isPlainObject(str)) {
      await dispatch("loadAncestors", str)
    }
    // return the curent meta anyway
    return state.meta
  }
}