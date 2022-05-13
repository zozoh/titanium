////////////////////////////////////////////////
function saveLocalBehavior(state, key, val) {
  if (state.lbkAt && !state.lbkOff) {
    // Ignore ? 
    if (state.lbkIgnore && state.lbkIgnore(key)) {
      return
    }
    // Save to local
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
    state.status = _.assign({}, state.status, {
      hasMeta: state.meta ? true : false
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
  // GUI Settings
  //
  //----------------------------------------
  setSchema(state, schema = {}) {
    state.schema = schema
  },
  //----------------------------------------
}
export default _M