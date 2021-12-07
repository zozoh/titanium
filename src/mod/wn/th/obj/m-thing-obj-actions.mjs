const _M = {
  //--------------------------------------------
  async loadMetaSchema({ state, commit }) {
    //console.log("reloadSchema")
    let tsId = state.thingSetId
    let aph = `id:${tsId}/thing-schema.json`
    let obj = await Wn.Io.loadMeta(aph)
    let schema = await Wn.Io.loadContent(obj, { as: "json" })

    // Load extends components
    if (!_.isEmpty(schema.components)) {
      let components = _.concat(schema.components)
      await Ti.App.topInstance().loadView({ components })
    }
    //console.log("setSchema", schema)
    commit("setSchema", schema[state.useMetaSchemaAs])
  },
  //--------------------------------------------
  async loadThingSetId({ state, commit }) {
    let meta = state.meta
    if (!meta) {
      return
    }
    if (_.isString(meta.th_set)) {
      commit("setThingSetId", meta.th_set)
    }
    // Load thingset ancestor by meta
    let ans = await Wn.Sys.exec2(`o id:${meta.id} @ancestors -um '{tp:"thing_set"}' @json -cqnl`)
    let first = _.first(ans)
    if (first && first.tp == "thing_set") {
      commit("setThingSetId", first.id)
    }
  },
  //--------------------------------------------
  /***
   * Reload All
   */
  async reload({ state, commit, dispatch, getters, rootState }, meta) {
    // Guard
    if (_.isString(meta)) {
      meta = await Wn.Io.loadMeta(meta)
    }
    if (!meta) {
      return await Ti.Toast.Open("Nil Meta", "warn")
    }
    if (!meta.id) {
      return await Ti.Toast.Open("Meta without ID", "warn")
    }

    // CheckThingSet ID
    commit("setMeta", meta)
    commit("setThingSetId", null)
    await dispatch("loadThingSetId")

    if (!state.thingSetId) {
      return await Ti.Toast.Open("Meta OutOfThingSet: " + meta.id, "warn")
    }

    // Reload meta schema
    if (state.useMetaSchemaAs) {
      await dispatch("loadMetaSchema")
    }
    // Reset schema
    else {
      commit("setMetaSchema", {})
    }

    //



    // All done
    commit("setStatus", { reloading: false })
  }
  //--------------------------------------------
}
export default _M