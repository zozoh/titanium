// Ti required(Wn)
////////////////////////////////////////////////
export default {
  //--------------------------------------------
  async saveCurrent({state, commit, dispatch}) {
    commit("setStatus", {saving:true})
    await dispatch("current/save")
    commit("setStatus", {saving:false})
  },
  //--------------------------------------------
  async reload({state, commit, dispatch}, meta) {
    console.log("thing-manager.reload", state)
    // Update New Meta
    if(meta) {
      commit("setHome", meta)
    }
    // Get meta back
    else {
      meta = state.meta
    }
    // Mark reloading
    commit("setStatus", {reloading:true})

    await dispatch("config/reload", meta)
    await dispatch("search/reload", meta)

    // Reload current
    if(state.current.meta) {
      // find new meta
      let currentId = state.current.meta.id
      let current = null
      for(let it of state.search.list) {
        if(it.id == currentId) {
          current = it
          break
        }
      }
      // Update the meta
      await dispatch("current/setCurrent", {
        meta : current, 
        loadContent : !_.isNull(state.current.content)
      })
    }

    console.log(state.current.meta, state.current.content)

    // All done
    commit("setStatus", {reloading:false})
  }
  //--------------------------------------------
}