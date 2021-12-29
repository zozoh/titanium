////////////////////////////////////////////////
async function loadConfigJson(state, key, dft) {
  // Guard
  let path = state[key]
  if (!path) {
    return dft
  }
  // Load
  let tsId = state.dirId
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
  async loadContent({ state, commit, dispatch }) {
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
    let scPath;
    if (state.meta) {
      scPath = state.meta.schema
    }
    if (!scPath && state.oDir) {
      scPath = state.oDir.schema
    }
    // Load schema
    let schema;
    if (scPath) {
      schema = Wn.Io.loadContent(scPath, { as: "json" })
    }
    schema = _.assign({}, schema)

    // Load extends components
    if (!_.isEmpty(schema.components)) {
      let components = _.concat(schema.components)
      await Ti.App.topInstance().loadView({ components })
    }
    //console.log("setSchema", schema)
    commit("setSchema", schema)

    if (schema.localBehaviorKeepAt) {
      commit("setLocalBehaviorKeepAt", schema.localBehaviorKeepAt)
    }
  },
  //--------------------------------------------
  loadDirId({ state, commit }) {
    let meta = state.meta
    if (!meta) {
      return
    }
    if ("DIR" == meta.race) {
      commit("setDirId", meta.id)
    } else {
      commit("setDirId", meta.pid)
    }
  },
  //--------------------------------------------
  applyBehavior({ state, commit }, be = {}) {
    // Eval behavior dynamicly
    let {
      filter, sorter, match,
      currentId, checkedIds,
      pageSize
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
    if (state.oDir) {
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

    // Analyze meta : oDir
    if ("DIR" == meta.race) {
      commit("setDir", meta)
      commit("setDirId", meta.id)
    }
    // Then meta should be a File
    else {
      // CheckThingSet ID
      commit("setMeta", meta)
      commit("setDirId", null)
      dispatch("loadDirId")
    }

    if (!state.dirId) {
      return await Ti.Toast.Open("Meta Without DirID: " + meta.id, "warn")
    }

    // Reload Configurations
    await dispatch("loadSchema")

    // Behavior
    commit("explainLocalBehaviorKeepAt")
    dispatch("updateSchemaBehavior")
    dispatch("restoreLocalBehavior")

    // Reload thing list
    await dispatch("reloadData");

    // All done
    commit("setStatus", { reloading: false })
  }
  //--------------------------------------------
}
export default _M