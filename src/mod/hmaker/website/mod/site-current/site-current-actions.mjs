export default {
  //----------------------------------------
  onChanged({state, commit}, payload) {
    // Guard
    if(!state.meta) {
      return
    }
    // Pure Text
    if(_.isString(payload)) {
      commit("setContent", payload||"");
    }
    // JSON data
    else if(Wn.Util.isMimeJson(state.meta.mime)) {
      let json = JSON.stringify(payload, null, '  ');
      commit("setContent", json)
    }
    // Others should be ignore
    // ...

    // Then sync the changed status
    commit("syncStatusChanged");
  },
  //----------------------------------------
  async save({state, commit}) {
    if(state.status.saving){
      return
    }

    commit("setStatus", {saving:true})

    let meta = state.meta
    let content = state.content
    let newMeta = await Wn.Io.saveContentAsText(meta, content)

    commit("setMeta",         newMeta)
    commit("setSavedContent", content)
    commit("setStatus",       {saving:false})
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
      return
    }
    // Init content as null
    let content = null
    let data = null
    commit("setStatus", {reloading:true})
    //......................................
    // For file
    if("FILE" == meta.race) {
      // need to be reload content
      content = await Wn.Io.loadContent(meta)
      if(Wn.Util.isMimeJson(meta.mime)) {
        data = JSON.parse(content)
      }
    }
    //......................................
    // For dir
    else if('DIR' == meta.race) {
      data = await Wn.Io.loadChildren(meta)
    }
    //......................................
    // Just update the meta
    commit("setStatus", {reloading:false})
    commit("setMeta", meta)
    commit("setContent", content)
    commit("setData", data||{})
    commit("setSavedContent", content)
    commit("syncStatusChanged")
  }
  //----------------------------------------
}