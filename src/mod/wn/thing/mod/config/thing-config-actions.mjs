// Ti required(Wn)
////////////////////////////////////////////////
export default {
  //----------------------------------------
  async reloadSchema({state, commit}) {
    let aph  = `id:${state.home.id}/thing-schema.json`
    let obj  = await Wn.Io.loadMeta(aph)
    let json = await Wn.Io.loadContent(obj, {as:"json"})
    //console.log("setSchema", json)
    commit("setSchema", json)
    return json
  },
  //----------------------------------------
  async reloadLayout({state, commit}) {
    let aph  = `id:${state.home.id}/thing-layout.json`
    let obj  = await Wn.Io.loadMeta(aph)
    let json = await Wn.Io.loadContent(obj, {as:"json"})
    //console.log("setLayout", json)
    commit("setLayout", json)
    return json
  },
  //----------------------------------------
  async reloadActions({state, commit}) {
    let aph  = `id:${state.home.id}/thing-actions.json`
    let obj  = await Wn.Io.loadMeta(aph)
    let json = await Wn.Io.loadContent(obj, {as:"json"})
    //console.log("setActions", json)
    commit("setActions", json)
    return json
  },
  //----------------------------------------
  async reload({state, commit, dispatch}, meta) {
    console.log("thing-manager-config.reload", state)
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

    await dispatch("reloadSchema")
    await dispatch("reloadLayout")
    await dispatch("reloadActions")

    // All done
    commit("setStatus", {reloading:false})
  }
  //----------------------------------------
}