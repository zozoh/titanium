////////////////////////////////////////////////
function saveLocalBehavior(state, key, val) {
  if (state.lbkAt && !state.lbkOff) {
    // Ignore ?
    if (state.lbkIgnore && state.lbkIgnore(key)) {
      return;
    }
    // Save to local
    let be = Ti.Storage.local.getObject(state.lbkAt);
    be[key] = val;
    Ti.Storage.local.setObject(state.lbkAt, be);
  }
}
////////////////////////////////////////////////
const _M = {
  //----------------------------------------
  setModuleName(state, moduleName) {
    state.moduleName = moduleName;
  },
  //----------------------------------------
  setAutoQueryList(state, autoQueryList) {
    state.autoQueryList = autoQueryList;
  },
  //----------------------------------------
  setPvg(state, pvg) {
    state.pvg = pvg;
  },
  //----------------------------------------
  assignPvg(state, pvg) {
    let po = _.cloneDeep(state.pvg || {});
    _.assign(po, pvg);
    state.pvg = po;
  },
  //----------------------------------------
  setLoad(state, load = {}) {
    state.load = load;
  },
  //----------------------------------------
  assignLoad(state, load = {}) {
    let d = _.cloneDeep(state.load);
    _.assign(d, load);
    state.load = d;
  },
  //----------------------------------------
  setView(state, view) {
    state.view = view;
  },
  //----------------------------------------
  setLocalBehaviorKeepAt(state, keyAt) {
    state.localBehaviorKeepAt = keyAt;
  },
  //----------------------------------------
  explainLocalBehaviorKeepAt(state) {
    let keyAt = state.localBehaviorKeepAt;
    state.lbkAt = Ti.Util.explainObj(state, keyAt);
    state.lbkIgnore = Ti.AutoMatch.parse(state.localBehaviorIgnore);
    state.schemaBeIgnore = Ti.AutoMatch.parse(state.schemaBehaviorIgnore);
  },
  //----------------------------------------
  setLbkOff(state, off = true) {
    state.lbkOff = off;
  },
  setLbkOn(state, on = true) {
    state.lbkOff = !on;
  },
  //----------------------------------------
  setExportScript(state, script) {
    state.exportScript = script;
  },
  //----------------------------------------
  assignExportSettings(state, settings) {
    let se = _.cloneDeep(state.exportSettings || {});
    _.assign(se, settings);
    state.exportSettings = se;
    let lse = _.pick(se, "mapping", "fields", "type", "mode", "scope", "expi");
    state.LOG("Keep Export Settings", lse);
    saveLocalBehavior(state, "exportSettings", lse);
  },
  //----------------------------------------
  setExportSettings(state, settings) {
    state.exportSettings = settings;
    let lse = _.pick(
      settings,
      "mapping",
      "fields",
      "type",
      "mode",
      "scope",
      "expi"
    );
    state.LOG("Keep Export Settings", lse);
    saveLocalBehavior(state, "exportSettings", lse);
  },
  //----------------------------------------
  assignImportSettings(state, settings) {
    let se = _.cloneDeep(state.importSettings || {});
    _.assign(se, settings);
    state.importSettings = se;
    let lse = _.pick(se, "mapping", "fields", "type", "mode", "scope", "expi");
    state.LOG("Keep Import Settings", lse);
    saveLocalBehavior(state, "exportSettings", lse);
  },
  //----------------------------------------
  setImportSettings(state, settings) {
    state.importSettings = settings;
    let lse = _.pick(
      settings,
      "mapping",
      "fields",
      "type",
      "mode",
      "scope",
      "expi"
    );
    state.LOG("Keep Import Settings", lse);
    saveLocalBehavior(state, "importSettings", lse);
  },
  //----------------------------------------
  setGuiShown(state, shown) {
    let guiShown = _.pickBy(shown, (v) => v);
    state.guiShown = guiShown;
    saveLocalBehavior(state, "guiShown", guiShown);
  },
  //----------------------------------------
  assignGuiShown(state, shown) {
    let shown2 = _.cloneDeep(state.guiShown);
    _.assign(shown2, shown);
    state.guiShown = _.pickBy(shown2, (v) => v);
    saveLocalBehavior(state, "guiShown", state.guiShown);
  },
  //----------------------------------------
  assignGuiShownNoKeep(state, shown) {
    let shown2 = _.cloneDeep(state.guiShown);
    _.assign(shown2, shown);
    state.guiShown = _.pickBy(shown2, (v) => v);
  },
  //----------------------------------------
  keepShownToLocal(state) {
    let shown = _.pickBy(state.guiShown, (v) => v);
    saveLocalBehavior(state, "guiShown", shown);
  },
  //----------------------------------------
  //
  // Thing Set
  //
  //----------------------------------------
  setThingSetId(state, thingSetId) {
    state.thingSetId = thingSetId;
  },
  //----------------------------------------
  setThingSet(state, oTs) {
    state.oTs = oTs;
  },
  //----------------------------------------
  //
  // Search
  //
  //----------------------------------------
  setFixedMatch(state, fm) {
    state.fixedMatch = _.cloneDeep(fm);
  },
  assignFixedMatch(state, fm) {
    let _old = _.cloneDeep(state.fixedMatch);
    state.fixedMatch = _.assign(_old, fm);
  },
  mergeFixedMatch(state, fm) {
    let _old = _.cloneDeep(state.fixedMatch);
    state.fixedMatch = _.merge(_old, fm);
  },
  //----------------------------------------
  setJoinOne(state, joinOne) {
    //console.log("setJoinOne", joinOne)
    state.joinOne = _.cloneDeep(joinOne);
  },
  //----------------------------------------
  /*
  agg: {
    "$ResultKey": {
      ignore: "name",   // AutoMatch filterKey to ignore when agg
      by: "value=COUNT:id name=name name:DESC" // agg setting
    }
  }
  */
  setAgg(state, agg) {
    state.agg = _.cloneDeep(agg);
  },
  //----------------------------------------
  /*
  aggResult: {
    "$ResultKey": [{
        "value": 13,
        "name": "T111"
      }, {
        "value": 18,
        "name": "T109"
      }]
  }
  */
  setAggResult(state, { key, result = [] } = {}) {
    if (key) {
      let re = _.clone(state.aggResult);
      re[key] = result;
      state.aggResult = re;
    }
  },
  //----------------------------------------
  setAggQuery(state, aggQuery) {
    state.aggQuery = aggQuery;
  },
  //----------------------------------------
  setAggAutoReload(state, aggAutoReload) {
    state.aggAutoReload = aggAutoReload;
  },
  //----------------------------------------
  setFilter(state, filter) {
    state.filter = _.omitBy(filter, (v) => Ti.Util.isNil(v));
    saveLocalBehavior(state, "filter", filter);
  },
  //----------------------------------------
  assignFilter(state, filter) {
    let flt = _.assign({}, state.filter, filter);
    flt = _.omitBy(flt, (v) => Ti.Util.isNil(v));
    state.filter = flt;
    saveLocalBehavior(state, "filter", filter);
  },
  //----------------------------------------
  setSorter(state, sorter) {
    state.sorter = sorter;
    saveLocalBehavior(state, "sorter", sorter);
  },
  //----------------------------------------
  setThingObjKeys(state, thingObjKeys) {
    state.thingObjKeys = thingObjKeys;
  },
  //----------------------------------------
  setList(state, list) {
    state.list = list;
  },
  //----------------------------------------
  prependListItem(state, newItem) {
    Ti.Util.UpsertStateDataItemAt(state, newItem, -1, "..");
  },
  //----------------------------------------
  appendListItem(state, newItem) {
    Ti.Util.UpsertStateDataItemAt(state, newItem, 1, "..");
  },
  //----------------------------------------
  setListItem(state, newItem) {
    Ti.Util.UpsertStateDataItemAt(state, newItem, 0, "..");
  },
  //----------------------------------------
  mergeListItem(state, theItem) {
    Ti.Util.MergeStateDataItem(state, theItem, "..");
  },
  //----------------------------------------
  removeListItems(state, items = []) {
    Ti.Util.RemoveStateDataItems(state, items, "..");
  },
  //----------------------------------------
  listCancelAll(state) {
    state.currentId = null;
    state.checkedIds = {};
  },
  //----------------------------------------
  setCurrentId(state, currentId) {
    state.currentId = currentId;
    state.status = _.assign({}, state.status, {
      "hasCurrent": !Ti.Util.isNil(currentId)
    });
    saveLocalBehavior(state, "currentId", currentId);
  },
  //----------------------------------------
  setCheckedIds(state, checkedIds) {
    let ids;
    if (_.isArray(checkedIds)) {
      ids = {};
      _.forEach(checkedIds, (v) => (ids[v] = true));
    } else {
      ids = _.pickBy(checkedIds, (v) => v);
    }
    state.checkedIds = ids;
    state.status = _.assign({}, state.status, {
      "hasChecked": !_.isEmpty(ids)
    });
    saveLocalBehavior(state, "checkedIds", ids);
  },
  //----------------------------------------
  setPager(state, pager) {
    state.pager = pager;
    let pageSize = Ti.Util.getValue(state.pager, "pageSize", "pgsz") || 0;
    saveLocalBehavior(state, "pageSize", pageSize);
  },
  //----------------------------------------
  assignPager(state, pager) {
    let pg = _.cloneDeep(state.pager || {});
    _.forEach(pager, (v, k) => {
      if (!Ti.Util.isNil(v)) {
        pg[k] = v;
      }
    });
    state.pager = pg;
    let pageSize = Ti.Util.getValue(state.pager, "pageSize", "pgsz") || 0;
    saveLocalBehavior(state, "pageSize", pageSize);
  },
  //----------------------------------------
  //
  // Meta / Date
  //
  //----------------------------------------
  setCurrentMeta(state) {
    let currentId = state.currentId;
    state.LOG("setCurrentMeta", currentId);
    let hasCurrent = true;
    // Clear current meta
    if (Ti.Util.isNil(currentId) || _.isEmpty(state.list)) {
      hasCurrent = false;
    }
    // Find current meta
    else {
      hasCurrent = false;
      for (let it of state.list) {
        if (it.id == currentId) {
          state.meta = it;
          hasCurrent = true;
          break;
        }
      }
    }
    // Reset current/checkedIds
    if (!hasCurrent) {
      state.meta = null;
      state.currentId = null;
      state.checkedIds = {};
      state.status = _.assign({}, state.status, {
        "hasMeta": false,
        "hasCurrent": false,
        "hasChecked": false
      });
    }
  },
  //----------------------------------------
  setMeta(state, meta) {
    state.meta = meta;
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
    state.LOG("setContent", content);
    if (content && !_.isString(content)) {
      content = JSON.stringify(content, null, "   ");
    }
    state.content = content;
  },
  //----------------------------------------
  setSavedContent(state, content) {
    state.LOG("setSavedContent", content);
    state.__saved_content = content;
  },
  //----------------------------------------
  setContentPath(state, contentPath) {
    //console.log("setContentPath", contentPath)
    state.contentPath = contentPath;
  },
  //----------------------------------------
  setContentType(state, contentType) {
    state.contentType = contentType;
  },
  //----------------------------------------
  setContentData(state, contentData) {
    state.contentData = contentData;
  },
  //----------------------------------------
  setStatus(state, status) {
    state.status = _.assign({}, state.status, status);
  },
  //----------------------------------------
  clearStatus(state) {
    state.status = {};
  },
  //----------------------------------------
  syncStatusChanged(state) {
    if (Ti.Util.isNil(state.content) && Ti.Util.isNil(state.__saved_content)) {
      state.status.changed = false;
    } else {
      state.status.changed = !_.isEqual(state.content, state.__saved_content);
    }
  },
  //----------------------------------------
  setFieldStatus(state, { name, type, text } = {}) {
    if (name) {
      let ukey = _.concat(name).join("-");
      Vue.set(state.fieldStatus, ukey, { type, text });
    }
  },
  //----------------------------------------
  clearFieldStatus(state, names = []) {
    // Clean All
    if (_.isEmpty(names)) {
      state.fieldStatus = {};
    }
    // Clear one
    else {
      state.fieldStatus = _.omit(state.fieldStatus, names);
    }
  },
  //----------------------------------------
  //
  // Files
  //
  //----------------------------------------
  setDataDirName(state, dirName) {
    state.dataDirName = dirName;
    saveLocalBehavior(state, "dataDirName", dirName);
  },
  setDataHome(state, dataHome) {
    state.dataHome = dataHome;
  },
  autoDataHome(state) {
    if (state.thingSetId && state.meta && state.meta.id) {
      state.dataHome = `id:${state.thingSetId}/data/${state.meta.id}/`;
    } else {
      state.dataHome = null;
    }
  },
  //----------------------------------------
  //
  // GUI Settings
  //
  //----------------------------------------
  setActionsPath(state, actionsPath) {
    state.actionsPath = actionsPath;
  },
  setLayoutPath(state, layoutPath) {
    state.layoutPath = layoutPath;
  },
  setSchemaPath(state, schemaPath) {
    state.schemaPath = schemaPath;
  },
  setMethodPaths(state, methodPaths) {
    state.methodPaths = methodPaths;
  },
  joinMethodPaths(state, methodPaths) {
    if (_.isArray(state.methodPaths)) {
      state.methodPaths = _.uniq(_.concat(state.methodPaths, methodPaths));
    } else {
      state.methodPaths = methodPaths;
    }
  },
  //----------------------------------------
  setThingActions(state, thingActions = {}) {
    state.thingActions = thingActions;
  },
  setLayout(state, layout = {}) {
    state.layout = layout;
  },
  setSchema(state, schema = {}) {
    state.schema = schema;
  },
  assignSchema(state, schema = {}) {
    state.schema = _.assign({}, state.schema, schema);
  },
  mergeSchema(state, schema = {}) {
    let sc = _.cloneDeep(state.schema);
    state.schema = _.merge(sc, schema);
  },
  setThingMethods(state, thingMethods = {}) {
    state.thingMethods = thingMethods;
  },
  assignThingMethods(state, thingMethods = {}) {
    state.thingMethods = _.assign({}, state.thingMethods, thingMethods);
  },
  //----------------------------------------
  //
  // Operations for dataDirFiles
  //
  //----------------------------------------
  setDataDirFiles(
    state,
    files = {
      list: [],
      pager: {}
    }
  ) {
    state.dataDirFiles = files;
  },
  //----------------------------------------
  setDataDirCurrentId(state, currentId) {
    state.dataDirCurrentId = currentId;
    saveLocalBehavior(state, "dataDirCurrentId", currentId);
  },
  //----------------------------------------
  setDataDirCheckedIds(state, checkedIds = {}) {
    let ids = _.pickBy(checkedIds, (v) => v);
    state.dataDirCheckedIds = ids;
    saveLocalBehavior(state, "dataDirCheckedIds", ids);
  },
  //----------------------------------------
  prependDataDirFile(state, newItem) {
    Ti.Util.UpsertStateDataItemAt(state, newItem, -1, "dataDirFiles");
  },
  //----------------------------------------
  appendDataDirFile(state, newItem) {
    Ti.Util.UpsertStateDataItemAt(state, newItem, 1, "dataDirFiles");
  },
  //----------------------------------------
  setDataDirFile(state, newItem) {
    Ti.Util.UpsertStateDataItemAt(state, newItem, 0, "dataDirFiles");
  },
  //----------------------------------------
  mergeDataDirFile(state, theItem) {
    Ti.Util.MergeStateDataDirFile(state, theItem, "dataDirFiles");
  },
  //----------------------------------------
  removeDataItems(state, items = []) {
    Ti.Util.RemoveStateDataItems(state, items, "dataDirFiles");
  },
  //----------------------------------------
  resetState(state) {
    _.assign(state, {
      "thingSetId": null,
      "oTs": null,
      "fixedMatch": {},
      "filter": {},
      "sorter": {
        "ct": -1
      },
      "thingObjKeys": null,
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
      "contentPath": [
        {
          "test": {
            "guiShown": {
              "content": true
            }
          },
          "path": "<self>"
        }
      ],
      "contentType": "<MIME>",
      "contentData": null,
      "dataHome": null,
      "dataDirName": null,
      "keepDataDirNameToLocal": true,
      "dataDirFiles": {
        "list": [],
        "pager": {
          "pn": 1,
          "pgsz": 50,
          "pgc": 0,
          "sum": 0,
          "skip": 0,
          "count": 0
        }
      },
      "dataDirCurrentId": null,
      "dataDirCheckedIds": {},
      "status": {
        "reloading": false,
        "doing": false,
        "saving": false,
        "deleting": false,
        "changed": false,
        "restoring": false,
        "hasChecked": false,
        "hasCurrent": true
      },
      "fieldStatus": {},
      "guiShown": {},
      "thingActions": null,
      "layout": {},
      "schema": {},
      "thingMethods": {}
    });
  }
  //----------------------------------------
};
export default _M;
