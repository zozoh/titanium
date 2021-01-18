const _M = {
  //----------------------------------------
  async reload({state, commit, dispatch}, meta) {
    if(state.status.reloading){
      return
    }
    //......................................
    // Use the default meta
    if(_.isUndefined(meta)) {
      meta = state.meta
    }
    //......................................
    if(_.isString(meta)) {
      meta = await Wn.Io.loadMeta(meta)
    }
    //......................................
    // Guard
    if(!meta) {
      commit("resetAll")
      return
    }
    // Init content as null
    commit("setStatus", {reloading:true})
    //......................................
    let ans = await Wn.Io.loadAncestors(`id:${meta.id}`)
    //......................................
    // Just update the meta
    commit("setAncestors", ans)
    commit("setMeta", meta)
    commit("setStatus", {reloading:false})
  }
  //----------------------------------------
}
export default _M;