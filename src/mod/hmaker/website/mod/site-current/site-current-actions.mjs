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
    else if(Wn.Util.isMimeJson(payload.mime)) {
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

    // Use the default meta
    if(_.isUndefined(meta)) {
      meta = state.meta
    }
    
    // Init content as null
    let content = null
    
    // Has meta, may need to be reload content
    if(meta) {
      commit("setStatus", {reloading:true})
      // need to be reload content
      content = await Wn.Io.loadContent(meta)
      commit("setStatus", {reloading:false})
    }
    // Just update the meta
    commit("setMeta", meta)
    commit("setContent", content)
    commit("setSavedContent", content)
    commit("syncStatusChanged")
  }
  //----------------------------------------
}