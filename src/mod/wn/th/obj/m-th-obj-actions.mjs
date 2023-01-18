////////////////////////////////////////////////
async function loadConfigJson(state, key, dft) {
  // Guard
  let path = state[key]
  if (!path) {
    return dft
  }
  // Load
  let aph = path
  if (!/^(~\/|id:|\/)/.test(path)) {
    let tsId = state.thingSetId
    aph = `id:${tsId}/${path}`
  }
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
  async loadContent({ state, commit, dispatch, getters }, { quiet = false } = {}) {
    // Which content should I load?
    let path = getters.contentLoadPath
    if (!path) {
      return
    }

    let meta;
    if (!quiet) {
      commit("setStatus", { reloading: true })
    }

    if ("<self>" != path) {
      meta = await Wn.Io.loadMeta(path)
    }
    // Use state
    else if (state.meta && 'FILE' == state.meta.race) {
      meta = state.meta
    }

    //console.log("load Content:", path)
    // No meta
    if (!meta) {
      state.LOG("updateContent => null")
      dispatch("updateContent", null)
      if (!quiet) {
        commit("setStatus", { reloading: false })
      }
      return
    }

    // Load meta content
    let content = await Wn.Io.loadContent(meta)
    dispatch("updateContent", content)
    //console.log("loadContent:", content)

    // All done
    if (!quiet) {
      commit("setStatus", { reloading: false })
    }

    return content
  },
  //--------------------------------------------
  async loadSchema({ state, commit }) {
    state.LOG(" - loadSchema")
    let schema = await loadConfigJson(state, "schemaPath", {})
    let components = []

    // <Apply view>
    if (state.view && state.view.schema) {
      _.forEach(state.view.schema, (vObj, k) => {
        let orgCom = schema[k]
        let { merge, comType, comConf } = vObj

        // Guard
        if (_.isEmpty(orgCom)) {
          schema[k] = { comType, comConf }
          return
        }

        // Maybe merge comConf or assign
        let keyInMerge = Ti.AutoMatch.parse(merge)

        // Com Type
        if (!Ti.Util.isNil(comType)) {
          orgCom.comType = comType
        }

        // Com Conf
        if (!_.isEmpty(comConf)) {
          // init comConf in schema
          if (_.isEmpty(orgCom.comConf)) {
            orgCom.comConf = comConf
            return;
          }

          let vwKeys = _.keys(comConf)
          for (let vwKey of vwKeys) {
            let vwVal = comConf[vwKey]
            if (keyInMerge(vwKey)) {
              _.merge(orgCom.comConf[vwKey], vwVal)
            } else {
              orgCom.comConf[vwKey] = vwVal
            }
          }
        }
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
    // Should set scheme after All deps components preloaded
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
    state.LOG(" > loadLayout")
    let reo = await loadConfigJson(state, "layoutPath", {})
    commit("setLayout", reo)
  },
  //--------------------------------------------
  async loadThingActions({ state, commit }) {
    state.LOG(" > loadThingActions")
    let reo = await loadConfigJson(state, "actionsPath", null)
    commit("setThingActions", reo)
  },
  //--------------------------------------------
  async loadThingMethods({ state, commit }) {
    state.LOG(" > loadThingMethods", state.methodPaths)
    let reo = {}

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
    state.LOG("loadThingSetId")
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
      agg, aggQuery,
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

    // Apply agg setting
    if (agg) {
      commit("setAgg", agg)
    }
    if (aggQuery) {
      commit("setAggQuery", aggQuery)
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
    if (pageSize > 0) {
      let pager = {}
      pager.pn = 1
      pager.pgsz = pageSize
      commit("assignPager", pager)
    }
  },
  //--------------------------------------------
  updateSchemaBehavior({ state, commit, dispatch }) {
    let be = _.get(state.schema, "behavior") || {}
    be = Ti.Util.explainObj(state, be)
    // Apply Ignore
    if (state.schemaBeIgnore) {
      let be2 = {}
      _.forEach(be, (v, k) => {
        if (!state.schemaBeIgnore(k)) {
          be2[k] = v
        }
      })
      be = be2
    }
    // Apply schema behaviors
    if (!_.isEmpty(be)) {
      commit("setLbkOff")
      dispatch("applyBehavior", be)
      commit("setLbkOn")
    }
  },
  //--------------------------------------------
  restoreLocalBehavior({ state, dispatch }) {
    // Guard
    if (!state.lbkAt || state.lbkOff) {
      return
    }
    // Load local setting
    let be = Ti.Storage.local.getObject(state.lbkAt)
    // Apply Ignore
    if (state.lbkIgnore) {
      let be2 = {}
      _.forEach(be, (v, k) => {
        if (!state.lbkIgnore(k)) {
          be2[k] = v
        }
      })
      be = be2
    }
    // Apply behaviors
    if (!_.isEmpty(be)) {
      dispatch("applyBehavior", be)
    }
  },
  //--------------------------------------------
  async reloadData({ state, dispatch, getters }) {
    state.LOG("reloadData")
    // Guard
    if (state.status.reloading
      || state.status.saving
      || state.status.deleting) {
      state.LOG("reloadData: Guard reject!")
      return
    }
    if (state.oTs) {
      state.LOG("reloadData: queryList")
      await dispatch("queryList");
    }
    if (getters.contentLoadPath) {
      state.LOG("reloadData: loadContent")
      await dispatch("loadContent")
    }
  },
  //--------------------------------------------
  /***
   * Reload All
   */
  async reload({ state, commit, dispatch, getters }, meta) {
    // Guard
    if (state.status.reloading
      || state.status.saving
      || state.status.deleting) {
      return
    }
    state.LOG = () => { }
    // if ("main" == state.moduleName) {
       state.LOG = console.log
    // }
    state.LOG(">>>>>>>>>>>>>> reload", meta, state.status.reloading)
    // Guard
    if (_.isString(meta)) {
      state.LOG("load meta", meta)
      meta = await Wn.Io.loadMeta(meta)
      state.LOG("get meta", meta)
    }

    // Guard: Nil meta
    if (!meta) {
      return await Ti.Toast.Open("Nil Meta", "warn")
    }
    if (!meta.id) {
      return await Ti.Toast.Open("Meta without ID", "warn")
    }

    // Analyze meta : oTs
    state.LOG("Analyze oTs and thingSetId")
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

    commit("setStatus", { reloading: true })

    // Reload Configurations
    state.LOG("<-------- Reload Config -------->")
    dispatch("applyViewBeforeLoad")
    await dispatch("loadSchema");
    await Promise.all([
      dispatch("loadLayout"),
      dispatch("loadThingActions"),
      dispatch("loadThingMethods")
    ])
    dispatch("applyViewAfterLoad")
    state.LOG("<-------- Config Loaded-------->")

    // Behavior
    commit("explainLocalBehaviorKeepAt")
    dispatch("updateSchemaBehavior")
    dispatch("restoreLocalBehavior")

    state.LOG(" >> Query Data ...")

    // Reload thing list
    if (state.oTs) {
      await dispatch("queryList");
      await dispatch("queryAggResult")
    }

    // Update dataHome
    commit("autoDataHome")

    // Reload content if neccessary
    if (getters.contentLoadPath) {
      await dispatch("loadContent")
    }

    // All done
    commit("setStatus", { reloading: false })
    state.LOG("<<<<<<<<<<<<<<<< done for reload")
  }
  //--------------------------------------------
}
export default _M