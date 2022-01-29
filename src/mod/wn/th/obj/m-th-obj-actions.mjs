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
  applyViewBeforeLoad({ state, commit }, view) {
    // Guard
    if (!state.view) {
      return
    }
    // Update to state
    _.forEach(state.view, (v, k) => {
      // Only set the paths
      if (/^((actions|layout|schema|method)Paths?)$/.test(k)) {
        let by = _.camelCase("set-" + k)
        commit(by, v)
      }
    })
  },
  //--------------------------------------------
  applyViewAfterLoad({ state, commit }, view) {
    // Guard
    if (!state.view) {
      return
    }
    // Update to state
    _.forEach(state.view, (v, k) => {
      // Ignore
      if (/^((actions|layout|schema|method)Paths?)$/.test(k)) {
        return
      }
      if (/^(view|path|lbkOff|thingSetId|oTs|meta|(__saved_)?content)$/.test(k)) {
        return
      }
      // Schema merged in "loadSchema" already
      if (/^(schema|components)$/.test(k)) {
        return
      }
      let by;
      // Assign
      if (/^(pager)$/.test(k)) {
        by = _.camelCase("assign-" + k)
      }
      // Others set
      else {
        by = _.camelCase("set-" + k)
      }
      // Update state by view
      commit(by, v)
    })
  },
  //--------------------------------------------
  async loadContent({ state, commit, dispatch, getters }) {
    // Guard : dataHome
    // if (!state.dataHome) {
    //   return
    // }
    // Guard : meta
    let meta = state.meta

    // Which content should I load?
    let path = getters.contentLoadPath
    if (!path) {
      return
    }
    if ("<self>" != path) {
      path = Ti.Util.appendPath(state.dataHome, path)
      meta = await Wn.Io.loadMeta(path)
    }

    //console.log("load Content:", path)
    // No meta
    if (!meta) {
      dispatch("updateContent", null)
      return
    }

    // Load meta content
    commit("setStatus", { reloading: true })
    let content = await Wn.Io.loadContent(meta)
    dispatch("updateContent", content)
    //console.log("loadContent:", content)

    // All done
    commit("setStatus", { reloading: false })
  },
  //--------------------------------------------
  async loadSchema({ state, commit }) {
    let schema = await loadConfigJson(state, "schemaPath", {})
    let components = []

    // <Apply view>
    if (state.view && state.view.schema) {
      _.forEach(state.view.schema, (v, k) => {
        let func = v.merge ? _.merge : _.assign;
        let vcom = _.pick(v, "comType", "comConf")
        func(schema[k], vcom)
      })
      if (!_.isEmpty(state.view.components)) {
        components = _.concat(components, state.view.components)
      }
    }
    // </Apply view>

    if (!_.isEmpty(schema.components)) {
      components = _.concat(components, schema.components)
    }

    // Load extends components
    if (!_.isEmpty(components)) {
      await Ti.App.topInstance().loadView({ components })
    }

    //console.log("setSchema", schema)
    commit("setSchema", schema)
    //console.log("schema", schema)

    if (schema.methods) {
      commit("setMethodPaths", schema.methods)
    }

    if (schema.localBehaviorKeepAt) {
      commit("setLocalBehaviorKeepAt", schema.localBehaviorKeepAt)
    }

    let contentPath = _.get(schema, "behavior.contentPath")
    if (contentPath) {
      commit("setContentPath", contentPath)
    }

  },
  //--------------------------------------------
  async loadLayout({ state, commit }) {
    let reo = await loadConfigJson(state, "layoutPath", {})
    commit("setLayout", reo)
  },
  //--------------------------------------------
  async loadThingActions({ state, commit }) {
    let reo = await loadConfigJson(state, "actionsPath", null)
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
  async reloadData({ state, dispatch, getters }) {
    if (state.oTs) {
      await dispatch("queryList");
    }
    if (getters.contentLoadPath) {
      await dispatch("loadContent")
    }
  },
  //--------------------------------------------
  /***
   * Reload All
   */
  async reload({ state, commit, dispatch, getters }, meta) {
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
    // Maybe a thing_view (JSON)
    else if ("thing_view" == meta.tp && "FILE" == meta.race) {
      let view = await Wn.Io.loadContent(meta, { as: "json" })
      commit("setView", view)
      if (view.path) {
        let oTs = await Wn.Io.loadMeta(view.path)
        commit("setThingSet", oTs)
        commit("setThingSetId", oTs.id)
      }
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
    dispatch("applyViewBeforeLoad")
    await dispatch("loadSchema")
    await dispatch("loadLayout")
    await dispatch("loadThingActions")
    await dispatch("loadThingMethods")
    dispatch("applyViewAfterLoad")

    // Behavior
    commit("explainLocalBehaviorKeepAt")
    dispatch("updateSchemaBehavior")
    dispatch("restoreLocalBehavior")

    // Reload thing list
    if (state.oTs) {
      await dispatch("queryList");
    }

    // Update dataHome
    commit("autoDataHome")

    // Reload content if neccessary
    if (getters.contentLoadPath) {
      await dispatch("loadContent")
    }

    // All done
    commit("setStatus", { reloading: false })
  }
  //--------------------------------------------
}
export default _M