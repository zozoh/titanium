const _M = {
  //----------------------------------------
  setModuleName(state, moduleName) {
    state.moduleName = moduleName
  },
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
  //----------------------------------------
  //
  // Meta / Date
  //
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
    state.content = content
  },
  //----------------------------------------
  setData(state, data) {
    state.data = data
  },
  //----------------------------------------
  setSavedContent(state, content) {
    state.__saved_content = content
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
  setKeepDataDirNameToLocal(state, kddtl) {
    state.keepDataDirNameToLocal = kddtl
  },
  //----------------------------------------
  setDataDirName(state, dirName) {
    state.dataDirName = dirName
    if (state.meta && state.keepDataDirNameToLocal) {
      let localDirNameKey = `${state.meta.id}_thobj_dirname`
      Ti.Storage.session.set(localDirNameKey, dirName)
    }
  },
  setDataHome(state, dataHome) {
    state.dataHome = dataHome
  },
  setDataHomeObj(state, dataHomeObj) {
    state.dataHomeObj = _.cloneDeep(dataHomeObj)
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
    state.methodPath = methodPaths
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
  },
  //----------------------------------------
  setDataDirCheckedIds(state, checkedIds = {}) {
    state.dataDirCheckedIds = _.pickBy(checkedIds, v => v)
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