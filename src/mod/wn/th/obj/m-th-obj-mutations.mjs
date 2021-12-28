////////////////////////////////////////////////
function saveLocalBehavior(state, key, val) {
  if (state.lbkAt && !state.lbkOff) {
    let be = Ti.Storage.session.getObject(state.lbkAt)
    be[key] = val
    Ti.Storage.session.setObject(state.lbkAt, be)
  }
}
////////////////////////////////////////////////
const _M = {
  //----------------------------------------
  setModuleName(state, moduleName) {
    state.moduleName = moduleName
  },
  //----------------------------------------
  setLocalBehaviorKeepAt(state, keyAt) {
    state.localBehaviorKeepAt = keyAt
  },
  //----------------------------------------
  explainLocalBehaviorKeepAt(state) {
    let keyAt = state.localBehaviorKeepAt;
    state.lbkAt = Ti.Util.explainObj(state, keyAt)
  },
  //----------------------------------------
  setLbkOff(state, off = true) { state.lbkOff = off },
  setLbkOn(state, on = true) { state.lbkOff = !on },
  //----------------------------------------
  setGuiShown(state, shown) {
    let guiShown = _.pickBy(shown, v => v)
    state.guiShown = guiShown
    saveLocalBehavior(state, "guiShown", guiShown)
  },
  //----------------------------------------
  //
  // Thing Set
  //
  //----------------------------------------
  setThingSetId(state, thingSetId) {
    state.thingSetId = thingSetId
  },
  //----------------------------------------
  setThingSet(state, oTs) {
    state.oTs = oTs
  },
  //----------------------------------------
  //
  // Search
  //
  //----------------------------------------
  setFixedMatch(state, fm) {
    state.fixedMatch = _.cloneDeep(fm)
  },
  //----------------------------------------
  setFilter(state, filter) {
    state.filter = filter
    saveLocalBehavior(state, "filter", filter)
  },
  //----------------------------------------
  setSorter(state, sorter) {
    state.sorter = sorter
    saveLocalBehavior(state, "sorter", sorter)
  },
  //----------------------------------------
  setThingObjKeys(state, thingObjKeys) {
    state.thingObjKeys = thingObjKeys
  },
  //----------------------------------------
  setList(state, list) {
    state.list = list
  },
  //----------------------------------------
  prependListItem(state, newItem) {
    Ti.Util.UpsertStateDataItemAt(state, newItem, -1, "..")
  },
  //----------------------------------------
  appendListItem(state, newItem) {
    Ti.Util.UpsertStateDataItemAt(state, newItem, 1, "..")
  },
  //----------------------------------------
  setListItem(state, newItem) {
    Ti.Util.UpsertStateDataItemAt(state, newItem, 0, "..")
  },
  //----------------------------------------
  mergeListItem(state, theItem) {
    Ti.Util.MergeStateDataItem(state, theItem, "..")
  },
  //----------------------------------------
  removeListItems(state, items = []) {
    Ti.Util.RemoveStateDataItems(state, items, "..")
  },
  //----------------------------------------
  setCurrentId(state, currentId) {
    state.currentId = currentId
    saveLocalBehavior(state, "currentId", currentId)
  },
  //----------------------------------------
  setCheckedIds(state, checkedIds) {
    let ids
    if (_.isArray(checkedIds)) {
      ids = {}
      let c2 = _.filter(checkedIds, v => v)
      _.forEach(c2, v => ids[v] = true)
    } else {
      ids = _.pickBy(checkedIds, v => v)
    }
    state.checkedIds = ids
    saveLocalBehavior(state, "checkedIds", ids)
  },
  //----------------------------------------
  setPager(state, pager) {
    state.pager = pager
    let pageSize = Ti.Util.getValue(state.pager, "pageSize", "pgsz") || 0
    saveLocalBehavior(state, "pageSize", pageSize)
  },
  //----------------------------------------
  assignPager(state, pager) {
    let pg = _.cloneDeep(state.pager || {})
    _.forEach(pager, (v, k) => {
      if (!Ti.Util.isNil(v)) {
        pg[k] = v
      }
    })
    state.pager = pg
    let pageSize = Ti.Util.getValue(state.pager, "pageSize", "pgsz") || 0
    saveLocalBehavior(state, "pageSize", pageSize)
  },
  //----------------------------------------
  //
  // Meta / Date
  //
  //----------------------------------------
  setCurrentMeta(state) {
    let currentId = state.currentId
    // Clear current meta
    if (Ti.Util.isNil(currentId) || _.isEmpty(state.list)) {
      state.meta = null
    }
    // Find current meta
    else {
      let found = false
      for (let it of state.list) {
        if (it.id == currentId) {
          state.meta = it
          found = true
          break
        }
      }
      if (!found) {
        state.meta = null
      }
    }
  },
  //----------------------------------------
  setMeta(state, meta) {
    state.meta = meta
  },
  //--------------------------------------------
  assignMeta(state, meta) {
    state.meta = _.assign({}, state.meta, meta);
  },
  //--------------------------------------------
  mergeMeta(state, meta) {
    state.meta = _.merge({}, state.meta, meta);
  },
  //----------------------------------------
  setContent(state, content) {
    if (content && !_.isString(content)) {
      content = JSON.stringify(content, null, '   ')
    }
    state.content = content
  },
  //----------------------------------------
  setSavedContent(state, content) {
    state.__saved_content = content
  },
  //----------------------------------------
  setContentPath(state, contentPath) {
    state.contentPath = contentPath
  },
  //----------------------------------------
  setStatus(state, status) {
    state.status = _.assign({}, state.status, status)
  },
  //----------------------------------------
  syncStatusChanged(state) {
    if (Ti.Util.isNil(state.content) && Ti.Util.isNil(state.__saved_content)) {
      state.status.changed = false
    } else {
      state.status.changed = !_.isEqual(state.content, state.__saved_content)
    }
  },
  //----------------------------------------
  setFieldStatus(state, { name, type, text } = {}) {
    if (name) {
      let ukey = _.concat(name).join("-")
      Vue.set(state.fieldStatus, ukey, { type, text })
    }
  },
  //----------------------------------------
  clearFieldStatus(state, names = []) {
    // Clean All
    if (_.isEmpty(names)) {
      state.fieldStatus = {}
    }
    // Clear one
    else {
      state.fieldStatus = _.omit(state.fieldStatus, names)
    }
  },
  //----------------------------------------
  //
  // Files
  //
  //----------------------------------------
  setDataDirName(state, dirName) {
    state.dataDirName = dirName
    saveLocalBehavior(state, "dataDirName", dirName)
  },
  setDataHome(state, dataHome) {
    state.dataHome = dataHome
  },
  autoDataHome(state, dataHome) {
    if (state.thingSetId && state.meta && state.meta.id) {
      state.dataHome = `id:${state.thingSetId}/data/${state.meta.id}/`
    } else {
      state.dataHome = null
    }
  },
  //----------------------------------------
  //
  // GUI Settings
  //
  //----------------------------------------
  setActionsPath(state, actionsPath) {
    state.actionsPath = actionsPath
  },
  setLayoutPath(state, layoutPath) {
    state.layoutPath = layoutPath
  },
  setSchemaPath(state, schemaPath) {
    state.schemaPath = schemaPath
  },
  setMethodPaths(state, methodPaths) {
    state.methodPaths = methodPaths
  },
  //----------------------------------------
  setThingActions(state, thingActions = {}) {
    state.thingActions = thingActions
  },
  setLayout(state, layout = {}) {
    state.layout = layout
  },
  setSchema(state, schema = {}) {
    state.schema = schema
  },
  setThingMethods(state, thingMethods = {}) {
    state.thingMethods = thingMethods
  },
  //----------------------------------------
  //
  // Operations for dataDirFiles
  //
  //----------------------------------------
  setDataDirFiles(state, files = []) {
    state.dataDirFiles = files
  },
  //----------------------------------------
  setDataDirCurrentId(state, currentId) {
    state.dataDirCurrentId = currentId
    saveLocalBehavior(state, "dataDirCurrentId", currentId)
  },
  //----------------------------------------
  setDataDirCheckedIds(state, checkedIds = {}) {
    let ids = _.pickBy(checkedIds, v => v)
    state.dataDirCheckedIds = ids
    saveLocalBehavior(state, "dataDirCheckedIds", ids)
  },
  //----------------------------------------
  prependDataDirFile(state, newItem) {
    Ti.Util.UpsertStateDataItemAt(state, newItem, -1, "dataDirFiles")
  },
  //----------------------------------------
  appendDataDirFile(state, newItem) {
    Ti.Util.UpsertStateDataItemAt(state, newItem, 1, "dataDirFiles")
  },
  //----------------------------------------
  setDataDirFile(state, newItem) {
    Ti.Util.UpsertStateDataItemAt(state, newItem, 0, "dataDirFiles")
  },
  //----------------------------------------
  mergeDataDirFile(state, theItem) {
    Ti.Util.MergeStateDataDirFile(state, theItem, "dataDirFiles")
  },
  //----------------------------------------
  removeDataItems(state, items = []) {
    Ti.Util.RemoveStateDataItems(state, items, "dataDirFiles")
  },
  //----------------------------------------
}
export default _M