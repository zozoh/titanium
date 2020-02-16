export default {
  //----------------------------------------
  onChanged({commit}, payload) {
    commit("setContent", payload)
    commit("syncStatusChanged");
  },
  //----------------------------------------
  async save({state, commit}) {
    if(state.status.saving || !state.status.changed){
      return
    }

    let meta = state.meta
    let content = state.content
    let newMeta = await Wn.Io.saveContentAsText(meta, content)

    commit("setMeta",         newMeta)
    commit("setSavedContent", content)
    commit("syncStatusChanged")

    // return the new meta
    return newMeta
  },
  //----------------------------------------
  async reload({state, commit}, meta) {
    if(state.status.reloading
      || state.status.saving){
      return
    }
    //......................................
    // Use the default meta
    if(_.isUndefined(meta)) {
      meta = state.meta
    }
    //......................................
    // Guard
    if(!meta) {
      commit("setMeta", null)
      commit("setContent", null)
      return
    }
    // Init content as null
    let content = null
    commit("setStatus", {reloading:true})
    //......................................
    // For file
    if("FILE" == meta.race) {
      // need to be reload content
      content = await Wn.Io.loadContent(meta)
    }
    //......................................
    // For dir
    else if('DIR' == meta.race) {
      content = await Wn.Io.loadChildren(meta)
    }
    //......................................
    // Just update the meta
    commit("setStatus", {reloading:false})
    commit("setMeta", meta)
    commit("setContent", content)
    //commit("setData", data||{})
    commit("setSavedContent", state.content)
    commit("syncStatusChanged")
  }
  //----------------------------------------
}