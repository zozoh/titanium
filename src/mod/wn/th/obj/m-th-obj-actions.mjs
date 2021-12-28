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
    let schema = await loadConfigJson(state, "schemaPath", {})

    // Load extends components
    if (!_.isEmpty(schema.components)) {
      let components = _.concat(schema.components)
      await Ti.App.topInstance().loadView({ components })
    }
    //console.log("setSchema", schema)
    commit("setSchema", schema)
    //console.log("schema", schema)

    if(schema.methods) {
      commit("setMethodPaths", schema.methods)
    }

    if (schema.localBehaviorKeepAt) {
      commit("setLocalBehaviorKeepAt", schema.localBehaviorKeepAt)
    }

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
    //console.log("loadThingMethods", state.methodPaths)

    // Load
    if (state.methodPaths) {
      //let methodsUri = `./${state.methodPaths}`
      let methods = await Ti.Load(state.methodPaths, {
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
  applyBehavior({ state, commit }, be = {}) {
    // Eval behavior dynamicly
    let {
      filter, sorter, match,
      currentId, checkedIds,
      pageSize,
      dataDirName,
      dataDirCurrentId, dataDirCheckedIds,
      guiShown
    } = be

    // Apply filter
    if (!_.isEmpty(filter)) {
      commit("setFilter", filter)
    }

    // Apply sorter
    if (!_.isEmpty(sorter)) {
      commit("setSorter", sorter)
    }

    // Apply fixed match
    if (!_.isEmpty(match)) {
      commit("setFixedMatch", match)
    }

    // Checked and current
    if (!Ti.Util.isNil(currentId)) {
      commit("setCurrentId", currentId)
    }
    if (!_.isEmpty(checkedIds)) {
      commit("setCheckedIds", checkedIds)
    }

    // Data Dir
    if (!Ti.Util.isNil(dataDirName)) {
      commit("setDataDirName", dataDirName)
    }
    if (!Ti.Util.isNil(dataDirCurrentId)) {
      commit("setDataDirCurrentId", dataDirCurrentId)
    }
    if (!Ti.Util.isNil(dataDirCheckedIds)) {
      commit("setDataDirCheckedIds", dataDirCheckedIds)
    }

    // Apply shown
    if (!_.isEmpty(guiShown)) {
      commit("setGuiShown", guiShown)
    }


    // Apply pager
    let pager = {}
    if (pageSize > 0) {
      pager.pn = 1
      pager.pgsz = pageSize
    }
    commit("assignPager", pager)
  },
  //--------------------------------------------
  updateSchemaBehavior({ state, commit, dispatch }) {
    let be = _.get(state.schema, "behavior") || {}
    be = Ti.Util.explainObj(state, be)
    if (!_.isEmpty(be)) {
      commit("setLbkOff")
      dispatch("applyBehavior", be)
      commit("setLbkOn")
    }
  },
  //--------------------------------------------
  restoreLocalBehavior({ state, dispatch }) {
    // Guard
    if (!state.lbkAt) {
      return
    }
    // Load local setting
    let be = Ti.Storage.session.getObject(state.lbkAt)
    if (!_.isEmpty(be)) {
      dispatch("applyBehavior", be)
    }
  },
  //--------------------------------------------
  async reloadData({ state, dispatch }) {
    if (state.oTs) {
      await dispatch("queryList");
    }
  },
  //--------------------------------------------
  /***
   * Reload All
   */
  async reload({ state, commit, dispatch }, meta) {
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

    // Behavior
    commit("explainLocalBehaviorKeepAt")
    dispatch("updateSchemaBehavior")
    dispatch("restoreLocalBehavior")

    // Reload thing list
    await dispatch("reloadData");

    // Update dataHome
    commit("autoDataHome")

    // All done
    commit("setStatus", { reloading: false })
  }
  //--------------------------------------------
}
export default _M