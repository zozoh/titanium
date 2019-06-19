// Ti required(Wn)
////////////////////////////////////////////////
export default {
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

    // All done
    commit("setStatus", {reloading:false})
  }
  //--------------------------------------------
}