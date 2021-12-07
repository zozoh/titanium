const _M = {
  //----------------------------------------
  setMeta(state, meta) {
    state.meta = meta
  },
  //----------------------------------------
  setThingSetId(state, thingSetId) {
    state.thingSetId = thingSetId
  },
  //----------------------------------------
  setModuleName(state, moduleName) {
    state.moduleName = moduleName
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
  setUseMetaSchemaAs(state, useMetaSchemaAs) {
    state.useMetaSchemaAs = useMetaSchemaAs
  },
  //----------------------------------------
  setMetaSchema(state, metaSchema={}) {
    state.metaSchema = metaSchema
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