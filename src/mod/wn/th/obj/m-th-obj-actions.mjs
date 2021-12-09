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
  let re = await Wn.Sys.exec(`cat ${aph}`)
  re = _.trim(re)

  // Not exists
  if (!re || /^e\./.test(re)) {
    return dft
  }

  // Parse As JSON
  return JSON.parse(re)
}
////////////////////////////////////////////////
const _M = {
  //----------------------------------------
  changeMeta({ commit }, { name, value } = {}) {
    if (name) {
      let meta = _.set({}, name, value)
      commit("mergeMeta", meta)
      commit("syncStatusChanged")
    }
  },
  //--------------------------------------------
  async updateMeta({ commit, dispatch }, { name, value } = {}) {
    //console.log("current.updateMeta", { name, value })
    let data = Ti.Types.toObjByPair({ name, value })
    await dispatch("updateMetas", data)
  },
  //--------------------------------------------
  async updateMetas({ state, commit }, data = {}) {
    // Check Necessary
    if (_.isMatchWith(state.meta, data, _.isEqual)) {
      return
    }

    if (!state.meta) {
      return await Ti.Toast.Open("ThObj meta without defined", "warn")
    }

    if (!state.thingSetId) {
      return await Ti.Toast.Open("ThObj thingSetId without defined", "warn")
    }

    // Mark field status
    _.forEach(data, (val, name) => {
      commit("setFieldStatus", { name, type: "spinning", text: "i18n:saving" })
    })

    // Do the update
    let json = JSON.stringify(data)
    let th_set = state.thingSetId
    let th_id = state.meta.id
    let cmdText = `thing id:${th_set} update ${th_id} -fields -cqn`
    let reo = await Wn.Sys.exec2(cmdText, { input: json, as: "json" })
    let isError = reo instanceof Error;

    if (!isError && !Ti.Util.isNil(reo)) {
      commit("setMeta", reo)
    }

    _.forEach(data, (val, name) => {
      if (isError) {
        commit("setFieldStatus", {
          name,
          type: "warn",
          text: reo.message || "i18n:fail"
        })
      } else {
        commit("setFieldStatus", {
          name,
          type: "ok",
          text: "i18n:ok"
        })
        _.delay(() => { commit("clearFieldStatus", name) }, 500)
      }
    })
  },
  //--------------------------------------------
  changeContent({ commit }, payload) {
    commit("setContent", payload)
    commit("syncStatusChanged");
  },
  //----------------------------------------
  updateContent({ commit }, content) {
    commit("setContent", content)
    commit("setSavedContent", content)
    commit("syncStatusChanged")
  },
  //--------------------------------------------
  async saveContent({ state, commit }) {
    if (state.status.saving || !state.status.changed) {
      return
    }

    commit("setStatus", { saving: true })

    let meta = state.meta
    let content = state.content
    let newMeta = await Wn.Io.saveContentAsText(meta, content)

    commit("setStatus", { saving: false })
    commit("setMeta", newMeta)
    commit("setSavedContent", content)
    commit("syncStatusChanged")

    // return the new meta
    return newMeta
  },
  //--------------------------------------------
  async loadContent({ state, commit }) {
    // Guard
    let meta = state.meta
    if (!meta) {
      return
    }
    // Load meta content
    commit("setStatus", { reloading: true })
    let content = await Wn.Io.loadContent(meta)
    dispatch("updateContent", content)
    commit("setStatus", { reloading: false })
  },
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
    let reo = await loadConfigJson(state, "actionsPath", [])
    commit("setThingActions", reo)
  },
  //--------------------------------------------
  async loadThingMethods({ state, commit }) {
    // Guard
    let reo = {}

    // Load
    if (state.methodPaths) {
      let methodsUri = `./${state.methodPaths}`
      let methods = await Ti.Load(methodsUri, {
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
  async loadThingList({state, commit}) {

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

    // Analyze meta : oTs
    if ("thing_set" == meta.tp && "DIR" == meta.race) {
      commit("setThingSet", meta)
      commit("setThingSetId", meta.id)
      await dispatch("loadThingList")
    }
    // Then meta should be a thing
    else {
      // CheckThingSet ID
      commit("setMeta", meta)
      commit("setThingSetId", null)
      await dispatch("loadThingSetId")
    }

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