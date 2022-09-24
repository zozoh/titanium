////////////////////////////////////////////////
function saveLocalBehavior(state, key, val) {
  if (state.lbkAt && !state.lbkOff) {
    // Ignore ? 
    if (state.lbkIgnore && state.lbkIgnore(key)) {
      return
    }
    // Save to local
    let be = Ti.Storage.local.getObject(state.lbkAt)
    be[key] = val
    Ti.Storage.local.setObject(state.lbkAt, be)
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
    state.lbkIgnore = Ti.AutoMatch.parse(state.localBehaviorIgnore)
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
  // Object DIR
  //
  //----------------------------------------
  setDirId(state, dirId) {
    state.dirId = dirId
  },
  //----------------------------------------
  setDir(state, oDir) {
    state.oDir = oDir
  },
  //----------------------------------------
  setMappingDirPath(state, dirPath) {
    state.mappingDirPath = dirPath
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
  setObjKeys(state, objKeys) {
    state.objKeys = objKeys
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
    if (newItem && newItem.id == state.currentId) {
      state.meta = newItem
    }
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
    state.status = _.assign({}, state.status, {
      hasCurrent: !Ti.Util.isNil(currentId)
    })
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
    state.status = _.assign({}, state.status, {
      hasChecked: !_.isEmpty(ids)
    })
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
    state.LOG("setCurrentMeta", currentId)
    let hasCurrent = true
    // Clear current meta
    if (Ti.Util.isNil(currentId) || _.isEmpty(state.list)) {
      hasCurrent = false
    }
    // Find current meta
    else {
      hasCurrent = false
      for (let it of state.list) {
        if (it.id == currentId) {
          state.meta = it
          hasCurrent = true
          break
        }
      }
    }
    // Reset current/checkedIds
    if (!hasCurrent) {
      state.meta = null
      state.currentId = null
    }
    // Update status
    state.status = _.assign({}, state.status, {
      "hasMeta": state.meta ? true : false,
      "hasCurrent": hasCurrent,
      "hasChecked": !_.isEmpty(state.checkedIds)
    })
  },
  //----------------------------------------
  setMeta(state, meta) {
    state.meta = meta
    state.status = _.assign({}, state.status, {
      hasMeta: meta ? true : false
    })
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
  setContentType(state, contentType) {
    state.contentType = contentType
  },
  //----------------------------------------
  setContentData(state, contentData) {
    state.contentData = contentData
  },
  //----------------------------------------
  setContentQuietParse(state, quietParse) {
    state.contentQuietParse = quietParse
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
  setItemStatus(state, status = {}) {
    state.itemStatus = _.assign({}, state.itemStatus, status)
  },
  //----------------------------------------
  clearItemStatus(state, names = []) {
    // Clean All
    if (_.isEmpty(names)) {
      state.itemStatus = {}
    }
    // Clear one
    else {
      state.itemStatus = _.omit(state.itemStatus, names)
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
  setObjActions(state, objActions = {}) {
    state.objActions = objActions
  },
  setLayout(state, layout = {}) {
    state.layout = layout
  },
  setSchema(state, schema = {}) {
    state.schema = schema
  },
  assignSchema(state, schema = {}) {
    state.schema = _.assign({}, state.schema, schema)
  },
  mergeSchema(state, schema = {}) {
    let sc = _.cloneDeep(state.schema)
    state.schema = _.merge(sc, schema)
  },
  setObjMethods(state, objMethods = {}) {
    state.objMethods = objMethods
  },
  assignObjMethods(state, objMethods = {}) {
    state.objMethods = _.assign({}, state.objMethods, objMethods)
  },
  //----------------------------------------
  resetState(state) {
    _.assign(state, {
      "dirId": null,
      "oDir": null,
      "mappingDirPath": null,
      "fixedMatch": {},
      "filter": {},
      "sorter": {
        "nm": 1
      },
      "objKeys": null,
      "list": [],
      "currentId": null,
      "checkedIds": {},
      "pager": {
        "pn": 1,
        "pgsz": 50,
        "pgc": 0,
        "sum": 0,
        "skip": 0,
        "count": 0
      },
      "meta": null,
      "content": null,
      "__saved_content": null,
      "contentPath": "<self>",
      "contentType": "<MIME>",
      "contentData": null,
      "contentQuietParse": false,
      "status": {
        "reloading": false,
        "doing": false,
        "saving": false,
        "deleting": false,
        "changed": false,
        "restoring": false,
        "hasCurrent": false,
        "hasChecked": false,
        "hasMeta": false
      },
      "fieldStatus": {},
      "guiShown": {},
      "objActions": null,
      "layout": {},
      "schema": {},
      "objMethods": {}
    })
  },
  //----------------------------------------
}
export default _M