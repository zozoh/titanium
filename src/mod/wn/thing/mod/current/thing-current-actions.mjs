// Ti required(Wn)
////////////////////////////////////////////////
export default {
  //--------------------------------------------
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

    // return the new meta
    return newMeta
  },
  //--------------------------------------------
  async updateMeta({state, commit}, payload) {
    console.log("I am update", payload)
    // commit("setFieldValue", {name, value})
    // commit("clearFieldStatus", [name])
    // commit("syncStatusChanged")
    // commit("set", {data: state.data})
  },
  //--------------------------------------------
  async reload({state, commit}, meta) {
    if(state.status.reloading
      || state.status.saving){
      return
    }

    // Use the default meta
    if(!meta) {
      meta = state.meta
    }
    
    commit("setStatus", {reloading:true})

    let content = null
    if(meta) {
      content = await Wn.Io.loadContent(meta)
    }

    commit("setMeta",         meta)
    commit("setContent",      content)
    commit("setSavedContent", content)
    commit("setStatus",       {reloading:false})

    // return the loaded content
    return content
  },
  //--------------------------------------------
  async setCurrent({commit,dispatch}, {
    meta=null, loadContent=false
  }={}) {
    console.log("setCurrent", meta, loadContent)
    
    // Load content and meta
    let content = null
    if(loadContent) {
      content = await dispatch("reload", meta)
    }
    // Just update the meta
    else {
      commit("setMeta", meta)
    }

    return {meta, content}
  }
  //--------------------------------------------
}