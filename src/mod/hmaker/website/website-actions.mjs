// Ti required(Wn)
////////////////////////////////////////////////
export default {
  //--------------------------------------------
  async reloadPage({state, commit, dispatch}) {
    
  },
  //--------------------------------------------
  async reloadSite({state, commit, dispatch}) {
    
  },
  //--------------------------------------------
  async reloadApp({state, commit, dispatch}) {
    
  },
  //--------------------------------------------
  async reloadTree({state, commit, dispatch}) {
    await dispatch("tree/reloadRoot", state.meta)
  },
  //--------------------------------------------
  async reloadTreeNode({state, commit, dispatch}, payload) {
    commit("setStatus", {reloading:true})
    await dispatch("tree/reloadNode", payload)
    commit("setStatus", {reloading:false})
  },
  //--------------------------------------------
  async reload({state, commit, dispatch}, meta) {
    //console.log("thing-manager.reload", state)
    // Update New Meta
    if(meta) {
      commit("setMeta", meta)
    }
    // Get meta back
    else {
      meta = state.meta
    }
    // Mark reloading
    commit("setStatus", {reloading:true})

    // Reloading
    await dispatch("reloadTree")
    await dispatch("reloadApp")
    await dispatch("reloadSite")

    // Auto Select the first item
    // TODO


    // All done
    commit("setStatus", {reloading:false})
  }
  //--------------------------------------------
}