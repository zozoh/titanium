// Ti required(Wn)
////////////////////////////////////////////////
export default {
  //----------------------------------------
  async reloadSchema({state, commit}) {
    let aph  = `id:${state.meta.id}/thing-schema.json`
    let obj  = await Wn.Io.loadMeta(aph)
    let schema = await Wn.Io.loadContent(obj, {as:"json"})

    // Load extends methods
    if(schema.methods) {
      let methods = await Ti.Load(schema.methods)
      if(!_.isArray(methods)) {
        methods = [methods]
      }
      schema.methods = methods
    }
    //console.log("setSchema", json)
    commit("setSchema", schema)
    return schema
  },
  //----------------------------------------
  async reloadLayout({state, commit}) {
    let aph  = `id:${state.meta.id}/thing-layout.json`
    let obj  = await Wn.Io.loadMeta(aph)
    let json = await Wn.Io.loadContent(obj, {as:"json"})

    // Load shown from local before reload config
    let shown = Ti.Storage.session.getObject(state.meta.id)
    json.shown = _.assign({}, json.shown, shown)

    //console.log("setLayout", json)
    commit("setLayout", json)
    return json
  },
  //----------------------------------------
  async reloadActions({state, commit}) {
    let aph  = `id:${state.meta.id}/thing-actions.json`
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
      commit("setMeta", meta)
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