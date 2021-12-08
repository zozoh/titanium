////////////////////////////////////////////////
async function loadConfigJson(state, key, dft) {
  // Guard
  let path = state[key]
  if (!path) {
    return dft
  }
  // Load
  let tsId = state.thingSetId
  let aph = `id:${tsId}/${path}`
  let re = Wn.Sys.exec(`cat ${aph}`)

  // Not exists
  if (/^e\./.test(re)) {
    return dft
  }

  // Parse As JSON
  return JSON.parse(re)
}
////////////////////////////////////////////////
const _M = {
  //--------------------------------------------
  async loadSchema({ state, commit }) {
    let reo = await loadConfigJson(state, "schemaPath", {})

    // Load extends components
    if (!_.isEmpty(reo.components)) {
      let components = _.concat(reo.components)
      await Ti.App.topInstance().loadView({ components })
    }
    //console.log("setSchema", schema)
    commit("setSchema", reo)
  },
  //--------------------------------------------
  async loadLayout({ state, commit }) {
    let reo = await loadConfigJson(state, "layoutPath", {})
    commit("setLayout", reo)
  },
  //--------------------------------------------
  async loadThingActions({ state, commit }) {
    let reo = await loadConfigJson(state, "actionsPath", {})
    commit("setThingActions", reo)
  },
  //--------------------------------------------
  async loadThingMethods({ state, commit }) {
    // Guard
    let reo = {}

    // Load
    if (state.methodsPaths) {
      let methods = await Ti.Load(schema.methods, {
        dynamicAlias: new Ti.Config.AliasMapping({
          "^\./": `/o/content?str=id:${state.thingSetId}/`
        })
      })
      // Merge methods
      if (_.isArray(methods)) {
        for (let mt of methods) {
          _.assign(reo, mt)
        }
      } else {
        _.assign(reo, methods)
      }
    }

    // Done
    commit("setThingMethods", reo)
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

    // Reload Configurations
    await dispatch("loadSchema")
    await dispatch("loadLayout")
    await dispatch("loadThingActions")
    await dispatch("loadThingMethods")

    //



    // All done
    commit("setStatus", { reloading: false })
  }
  //--------------------------------------------
}
export default _M