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

    let content = await Wn.Io.loadContent(meta)

    commit("setMeta",         meta)
    commit("setContent",      content)
    commit("setSavedContent", content)
    commit("setStatus",       {reloading:false})

    // return the loaded content
    return content
  },
  //--------------------------------------------
  async setCurrent({commit,dispatch}, meta, loadContent) {
    console.log("setCurrent", meta, loadContent)
    
    commit("setMeta", meta)

    let content = null
    if(loadContent) {
      content = await dispatch("reload")
    }

    return {meta, content}
  }
  //--------------------------------------------
}