// Ti required(Wn)
////////////////////////////////////////////////
export default {
  //----------------------------------------
  updateShown({commit}, shown) {
    commit("mergeShown", shown)
    commit("persistShown")
  },
  //----------------------------------------
  async reloadSchema({state, commit}) {
    //console.log("reloadSchema")
    let aph  = `id:${state.meta.id}/thing-schema.json`
    let obj  = await Wn.Io.loadMeta(aph)
    let schema = await Wn.Io.loadContent(obj, {as:"json"})

    // Load extends methods
    if(schema.methods) {
      let methods = await Ti.Load(schema.methods, {
        dynamicAlias: new Ti.Config.AliasMapping({
          "^\./": `/o/content?str=id:${state.meta.id}/`
        })
      })
      if(!_.isArray(methods)) {
        methods = [methods]
      }
      schema.methods = methods
    }
    // Load extends components
    if(!_.isEmpty(schema.components)) {
      let components = _.concat(schema.components)
      await Ti.App.topInstance().loadView({components})
    }
    //console.log("setSchema", schema)
    commit("setSchema", schema)
    return schema
  },
  //----------------------------------------
  async reloadLayout({state, commit}) {
    //console.log("reloadLayout")
    let aph  = `id:${state.meta.id}/thing-layout.json`
    let obj  = await Wn.Io.loadMeta(aph)
    let json = await Wn.Io.loadContent(obj, {as:"json"})

    //console.log("setLayout", json)
    commit("setLayout", json)

    // Load shown from local before reload config
    commit("restoreShown")

    return json
  },
  //----------------------------------------
  async reloadActions({state, commit}) {
    // console.log("reloadActions")
    let aph  = `id:${state.meta.id}/thing-actions.json`
    let obj  = await Wn.Io.loadMeta(aph)
    let json = await Wn.Io.loadContent(obj, {as:"json"})
    //console.log("setActions", json)
    commit("setActions", json)
    return json
  },
  //----------------------------------------
  async reload({state, commit, dispatch}, meta) {
    //console.log("thing-manager-config.reload", state)
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