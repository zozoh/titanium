////////////////////////////////////////////////
async function getContentMeta(state, path) {
  state.LOG("getContentMeta", path);
  // Guard
  if (!path || !state.dirId) {
    return;
  }
  let meta;
  if ("<self>" != path) {
    let aph;
    // absolute path
    if (/^([\/~]\/|id:)/.test(path)) {
      aph = path;
    }
    // In parent dir
    else {
      aph = Ti.Util.appendPath(`id:${state.dirId}/`, path);
    }
    meta = await Wn.Io.loadMeta(aph);
    // If not exists, then create it
    if (!meta) {
      let cmdText = `touch '${aph}'`;
      await Wn.Sys.exec2(cmdText);
      meta = await Wn.Io.loadMeta(aph);
    }
  }
  // User self
  else {
    meta = state.meta;
  }

  return meta;
}
////////////////////////////////////////////////
const _M = {
  //--------------------------------------------
  //
  //               Create
  //
  //--------------------------------------------
  async doCreate({ state, dispatch }) {
    // Guard
    if (!state.dirId) {
      throw "doCreate without dirId";
    }
    // Load the creation setting
    let { types, freeCreate } = await Wn.Sys.exec(
      `ti creation -cqn id:${state.dirId}`,
      { as: "json" }
    );

    // Get creation information
    let no = await Ti.App.Open({
      title: "i18n:create",
      type: "info",
      position: "top",
      width: 640,
      height: "61.8%",
      comType: "wn-obj-creation",
      comConf: {
        types,
        freeCreate,
        autoFocus: true,
        enterEvent: "ok"
      },
      components: ["@com:wn/obj/creation"]
    });

    // User cancel
    if (!no || !no.name) {
      return;
    }

    // Check the newName contains the invalid char
    if (no.name.search(/[%;:"'*?`\t^<>\/\\]/) >= 0) {
      return await Ti.Alert("i18n:wn-create-invalid");
    }
    // Check the newName length
    if (no.length > 256) {
      return await Ti.Alert("i18n:wn-create-too-long");
    }

    // Default Race
    no.race = no.race || "FILE";

    if ("folder" == no.type) {
      no.type = undefined;
    }

    // Auto type
    if ("FILE" == no.race) {
      if (!no.type) {
        no.type = Ti.Util.getSuffixName(no.name);
      }

      // Auto append suffix name
      if (!no.name.endsWith(no.type)) {
        no.name += `.${no.type}`;
      }
    }

    // Prepare the obj
    let obj = {
      ...no.meta,
      nm: no.name,
      tp: no.type,
      race: no.race,
      mime: no.mime
    };
    state.LOG("doCreate", obj);

    await dispatch("create", obj);
  },
  //--------------------------------------------
  async create({ state, commit, dispatch, getters }, obj = {}) {
    // Guard
    if (!getters.isCanCreate) {
      return await Ti.Alert("i18n:e-pvg-fobidden", { type: "warn" });
    }
    if (!state.dirId) {
      return await Ti.Alert("State Has No dirId", { type: "warn" });
    }
    // Prepare the command
    let json = JSON.stringify(obj);
    let dirId = state.dirId;

    // Mark reloading
    commit("setStatus", { doing: true });

    // Do Create
    let cmdText = `o @create -p 'id:${dirId}' @json -cqn`;
    let newMeta = await Wn.Sys.exec2(cmdText, { input: json, as: "json" });

    if (newMeta && !(newMeta instanceof Error)) {
      // Append To Search List as the first
      commit("prependListItem", newMeta);

      // Set it as current
      dispatch("selectMeta", {
        currentId: newMeta.id,
        checkedIds: {
          [newMeta.id]: true
        }
      });
    }

    // Mark reloading
    commit("setStatus", { doing: false });

    // Return the new object
    return newMeta;
  },
  //--------------------------------------------
  //
  //               Rename
  //
  //--------------------------------------------
  async doRename({ state, commit, getters }) {
    // Guard
    if (!getters.isCanUpdate) {
      return await Ti.Alert("i18n:e-pvg-fobidden", { type: "warn" });
    }
    if (!state.meta) {
      return await Ti.Toast.Open("i18n:wn-rename-none", "warn");
    }

    let it = state.meta;
    state.LOG("doRename", it.id);

    // Get new name
    let newName = await Ti.Prompt(
      {
        text: "i18n:wn-rename",
        vars: { name: it.nm }
      },
      {
        title: "i18n:rename",
        placeholder: it.nm,
        value: it.nm
      }
    );
    newName = _.trim(newName);

    // User cancel
    if (!newName) {
      return;
    }

    // Check name invalid or not
    if (!Wn.Obj.isValidName(newName)) {
      return;
    }

    // Check the suffix Name
    let oldSuffix = Ti.Util.getSuffix(it.nm);
    let newSuffix = Ti.Util.getSuffix(newName);
    if ("FILE" == it.race && oldSuffix && oldSuffix != newSuffix) {
      let repair = await Ti.Confirm("i18n:wn-rename-suffix-changed");
      if (repair) {
        newName += oldSuffix;
      }
    }

    // Rename it
    let itemStatus = { [it.id]: "processing" };

    commit("setStatus", { renaming: true });
    commit("setItemStatus", itemStatus);

    try {
      let newMeta = await Wn.Sys.exec2(
        `o id:${it.id} @update 'nm:"${newName}"' @json -cqn`,
        { as: "json" }
      );

      // Error
      if (newMeta instanceof Error) {
        return await Ti.Toast.Open("i18n:wn-rename-fail", "error");
      }

      // Replace the data
      commit("setListItem", newMeta);
      commit("setCurrentMeta");
    } finally {
      // Clean status
      _.delay(async () => {
        commit("setStatus", { renaming: false });
        commit("clearItemStatus");
      }, 500);
    }
  },
  //--------------------------------------------
  //
  //               Delete
  //
  //--------------------------------------------
  async removeChecked(
    { state, commit, dispatch, getters },
    {
      hard, // hard remove or just move to recycleBin
      confirm, // A general warnning
      warnNotEmpty = true // If delete none-empty dir, warn it at first
    } = {}
  ) {
    // Guard
    if (!getters.isCanRemove) {
      await Ti.Alert("i18n:e-pvg-fobidden", { type: "warn" });
      return false;
    }
    if (!state.dirId) {
      throw "removeChecked: State Has No dirId";
    }

    let ids = Ti.Util.getTruthyKeyInArray(state.checkedIds);
    if (_.isEmpty(ids)) {
      await Ti.Alert("i18n:del-none");
      return false;
    }
    state.LOG("removeChecked", ids);

    // Config is hard
    hard = Ti.Util.fallback(hard, getters.isHardRemove, false);

    if (_.isUndefined(confirm) && (hard || getters.isInRecycleBin)) {
      confirm = "i18n:del-hard";
    }

    // If confirm
    if (confirm) {
      if (
        !(await Ti.Confirm(confirm, {
          type: "warn",
          vars: { N: ids.length }
        }))
      ) {
        return false;
      }
    }

    // If contains dir
    if (warnNotEmpty && getters.checkedItems) {
      let notEmptyDirs = [];
      let notEmptyQuery = [];
      for (let it of getters.checkedItems) {
        if ("DIR" == it.race) {
          notEmptyQuery.push(
            Wn.Sys.exec2(`count id:${it.id}`).then((re) => {
              let n = parseInt(_.trim(re));
              if (n > 0) {
                notEmptyDirs.push(it);
              }
            })
          );
        }
      }
      await Promise.all(notEmptyQuery);

      if (!_.isEmpty(notEmptyDirs)) {
        let N = notEmptyDirs.length;
        let tip = _.map(notEmptyDirs, (dir) => dir.title || dir.nm).join(", ");
        if (
          !(await Ti.Confirm("i18n:del-not-empty-dir", {
            type: "warn",
            vars: { N, tip }
          }))
        ) {
          return false;
        }
      }
    }

    let itemStatus = {};
    _.forEach(ids, (id) => (itemStatus[id] = "processing"));

    commit("setStatus", { deleting: true });
    commit("setItemStatus", itemStatus);

    // Prepare the cmds
    let cmd = ["o"];
    for (let id of ids) {
      cmd.push(`@get ${id}`);
    }
    cmd.push("@delete -r");
    let cmdText = cmd.join(" ");
    await Wn.Sys.exec2(cmdText);

    _.forEach(ids, (id) => (itemStatus[id] = "removed"));
    commit("setItemStatus", itemStatus);

    //console.log("getback current", current)
    _.delay(async () => {
      // Remove it from search list
      commit("removeListItems", ids);

      // Update current
      await dispatch("selectMeta");

      commit("setStatus", { deleting: false });
      commit("clearItemStatus");
    }, 500);

    return true;
  },
  //--------------------------------------------
  //
  //               Move to
  //
  //--------------------------------------------
  async moveTo({ state, commit, dispatch, getters }, setup = {}) {
    // Guard
    if (!getters.isCanUpdate) {
      return await Ti.Alert("i18n:e-pvg-fobidden", { type: "warn" });
    }
    if (!state.dirId) {
      throw "moveTo: State Has No dirId";
    }

    // Get the meta list
    let list = _.filter(state.list, (li) => state.checkedIds[li.id]);
    state.LOG("moveTo", list);

    if (_.isEmpty(list)) {
      return await Ti.Toast.Open("i18n:nil-item", "warn");
    }

    // Dialog
    await Wn.Io.moveTo(
      list,
      _.assign({}, setup, {
        base: state.oDir,
        // leafBy: [
        //   { race: "FILE" },
        //   { race: "DIR", tp: "article" }
        // ],
        // objMatch: {
        //   race: "DIR"
        // },
        markItemStatus: (itId, status) => {
          commit("setItemStatus", { [itId]: status });
        },
        doneMove: async () => {
          await dispatch("queryList");
        }
      })
    );
  },
  //--------------------------------------------
  //
  //                ZipChecked
  //
  //--------------------------------------------
  async doZipChecked({ state, commit, dispatch, getters }) {
    // Guard
    if (!getters.isCanUpdate) {
      return await Ti.Alert("i18n:e-pvg-fobidden", { type: "warn" });
    }
    let objs = getters.checkedItems;
    if (_.isEmpty(objs)) {
      await Ti.Alert("i18n:nil-obj", { type: "warn" });
      return;
    }

    let zipName = await Ti.Prompt("i18n:zip-target-name", {
      type: "info",
      value: `${state.oDir.nm}`
    });
    zipName = _.trim(zipName);
    if (!zipName) {
      return;
    }
    // zip 结尾
    if (!/\.zip$/.test(zipName)) {
      zipName += ".zip";
    }

    //Prepare command
    let cmds = ["zip", `"id:${state.oDir.id}/${zipName}"`];
    for (let obj of objs) {
      cmds.push(`id:${obj.id}`);
    }
    let cmdText = cmds.join(" ");

    // Process
    await Wn.OpenCmdPanel(cmdText);

    await dispatch("reloadData");
  },
  //--------------------------------------------
  //
  //                ZipChecked
  //
  //--------------------------------------------
  async doUnzipCurrent({ state, commit, dispatch, getters }) {
    // Guard
    if (!getters.isCanUpdate) {
      return await Ti.Alert("i18n:e-pvg-fobidden", { type: "warn" });
    }
    let obj = state.meta;
    if (_.isEmpty(obj)) {
      await Ti.Alert("i18n:nil-obj", { type: "warn" });
      return;
    }

    let targetName = await Ti.Prompt("i18n:unzip-target-name", {
      type: "info",
      value: `${Ti.Util.getMajorName(obj.nm)}`
    });
    targetName = _.trim(targetName);
    if (!targetName) {
      return;
    }

    //Prepare command
    let cmds = [
      "unzip",
      `"id:${obj.id}"`,
      `"id:${state.oDir.id}/${targetName}"`
    ];
    let cmdText = cmds.join(" ");

    // Process
    await Wn.OpenCmdPanel(cmdText);

    await dispatch("reloadData");
  },
  //--------------------------------------------
  //
  //                 Open
  //
  //--------------------------------------------
  async openContentEditor({ state, commit, dispatch, getters }) {
    // Guard
    let meta = await getContentMeta(state, getters.contentLoadPath);
    if (!meta) {
      return await Ti.Toast.Open("i18n:empty-data", "warn");
    }

    // Open Editor
    let newContent = await Wn.EditObjContent(meta, {
      content: state.content
    });

    // Cancel the editing
    if (_.isUndefined(newContent)) {
      return;
    }

    // Update the current editing
    await dispatch("changeContent", newContent);
    commit("syncStatusChanged");
  },
  //--------------------------------------------
  async openCurrentMetaEditor({ state, commit, dispatch, getters }) {
    // Guard
    if (!state.meta && !state.oDir) {
      return await Ti.Toast.Open("i18n:empty-data", "warn");
    }
    //.........................................
    // For current selected
    //.........................................
    if (state.meta) {
      let meta = await Wn.Sys.exec2(`o id:${state.meta.id} @json -path -cqn`, {
        as: "json"
      });
      // Edit current meta
      let reo = await Wn.EditObjMeta(meta, {
        fields: "default",
        autoSave: false
      });

      // Cancel the editing
      if (_.isUndefined(reo)) {
        return;
      }

      // Update the current editing
      let { updates } = reo;
      if (!_.isEmpty(updates)) {
        if (!getters.isCanUpdate) {
          return await Ti.Alert("i18n:e-pvg-fobidden", { type: "warn" });
        }
        return await dispatch("updateMeta", updates);
      }
      return state.meta;
    }
    //.........................................
    // For Whole thing thing
    //.........................................
    let meta = await Wn.Sys.exec2(`o id:${state.oDir.id} @json -path -cqn`, {
      as: "json"
    });
    let reo = await Wn.EditObjMeta(meta, {
      fields: "auto",
      autoSave: getters.isCanUpdate
    });
    // Cancel the editing
    if (!reo) {
      return;
    }
    commit("setDir", reo.data);
    return reo.data;
  },
  //--------------------------------------------
  async openCurrentPrivilege({ state, commit, dispatch }) {
    let meta = state.meta || state.oDir;

    if (!meta) {
      await Ti.Toast.Open("i18n:nil-obj");
      return;
    }

    let newMeta = await Wn.EditObjPvg(meta);

    // Update to current list
    if (newMeta) {
      // Update Current Meta
      //console.log("pvg", newMeta)
      if (state.meta && state.meta.id == newMeta.id) {
        commit("setMeta", newMeta);
      }
      // Update Thing Set
      else {
        await dispatch("reload", newMeta);
      }
    }

    return newMeta;
  },
  //--------------------------------------------
  //
  //                 Update
  //
  //--------------------------------------------
  async updateDirField({ state, commit, dispatch }, { name, value } = {}) {
    state.LOG("updateDirFields", { name, value });

    let uniqKey = Ti.Util.anyKey(name);
    Wn.Util.setFieldStatusBeforeUpdate({ commit }, uniqKey);

    let data = Ti.Types.toObjByPair({ name, value });
    let reo = await dispatch("updateDir", data);

    Wn.Util.setFieldStatusAfterUpdate({ commit }, uniqKey, reo);
  },
  //--------------------------------------------
  async updateDir({ dispatch }, data = {}) {
    await dispatch("updateMetaOrDir", { data, forMeta: false });
  },
  //--------------------------------------------
  async updateMetaField({ state, commit, dispatch }, { name, value } = {}) {
    state.LOG("updateMetaFields", { name, value });

    let uniqKey = Ti.Util.anyKey(name);
    Wn.Util.setFieldStatusBeforeUpdate({ commit }, uniqKey);

    let data = Ti.Types.toObjByPair({ name, value });
    let reo = await dispatch("updateMeta", data);

    Wn.Util.setFieldStatusAfterUpdate({ commit }, uniqKey, reo);

    return reo;
  },
  //--------------------------------------------
  async updateMeta({ dispatch }, data = {}) {
    return await dispatch("updateMetaOrDir", { data, forMeta: true });
  },
  //--------------------------------------------
  async updateMetaOrDir(
    { state, commit, getters },
    { forMeta = true, data = {} } = {}
  ) {
    // Guard
    if (!getters.isCanUpdate) {
      return await Ti.Alert("i18n:e-pvg-fobidden", { type: "warn" });
    }
    let taName = forMeta ? "meta" : "oDir";
    state.LOG("updateMetaOrDir", `(${taName})`, data);

    // Get obj
    let obj = forMeta ? state.meta : state.oDir;

    // Check Necessary
    if (_.isMatchWith(obj, data, _.isEqual)) {
      return obj;
    }

    if (!obj) {
      await Ti.Toast.Open(`WnObj ${taName} without defined`, "warn");
      return obj;
    }

    if (!state.dirId) {
      await Ti.Toast.Open("WnObj dirId without defined", "warn");
      return obj;
    }

    let uniqKey = Ti.Util.anyKey(_.keys(data));

    // Mark field status
    Wn.Util.setFieldStatusBeforeUpdate({ commit }, uniqKey);
    _.forEach(data, (_, name) => {
      Wn.Util.setFieldStatusBeforeUpdate({ commit }, name);
    });

    // Do the update
    let json = JSON.stringify(data);
    let oid = obj.id;
    let cmdText = `o id:${oid} @update @json -cqn`;
    let reo = await Wn.Sys.exec2(cmdText, { input: json, as: "json" });
    let isError = reo instanceof Error;

    if (!isError && !Ti.Util.isNil(reo)) {
      if (forMeta) {
        commit("setMeta", reo);
        commit("setListItem", reo);
      }
      // For oDir
      else {
        commit("setDir", reo);
      }
    }

    Wn.Util.setFieldStatusAfterUpdate({ commit }, uniqKey, reo);
    _.forEach(data, (_, name) => {
      Wn.Util.setFieldStatusAfterUpdate({ commit }, name, reo);
    });

    return reo;
  },
  //--------------------------------------------
  async batchUpdateCheckedItemsField(
    { state, commit, dispatch },
    { name, value } = {}
  ) {
    state.LOG("batchUpdateCheckedItemsField", { name, value });

    let uniqKey = Ti.Util.anyKey(name);
    Wn.Util.setFieldStatusBeforeUpdate({ commit }, uniqKey);

    let data = Ti.Types.toObjByPair({ name, value });
    let reo = await dispatch("batchUpdateCheckedItems", data);

    Wn.Util.setFieldStatusAfterUpdate({ commit }, uniqKey, reo);
  },
  //--------------------------------------------
  async batchUpdateCheckedItems({ state, commit, getters }, data = {}) {
    state.LOG("batchUpdateCheckedItems", data);
    // Guard
    if (!getters.isCanUpdate) {
      return await Ti.Alert("i18n:e-pvg-fobidden", { type: "warn" });
    }
    if (!state.dirId) {
      return await Ti.Alert("State Has No dirId", "warn");
    }

    let ids = Ti.Util.getTruthyKeyInArray(state.checkedIds);
    if (_.isEmpty(ids)) {
      return await Ti.Alert("i18n:nil-item");
    }

    let uniqKey = Ti.Util.anyKey(_.keys(data));

    // Mark field status
    Wn.Util.setFieldStatusBeforeUpdate({ commit }, uniqKey);
    _.forEach(data, (_, name) => {
      Wn.Util.setFieldStatusBeforeUpdate({ commit }, name);
    });

    // Do update
    let json = JSON.stringify(data);
    let th_set = state.thingSetId;
    let cmds = [`o`];
    for (let id of ids) {
      cmds.push(`@get ${id}`);
    }
    cmds.push("@update @json -cqnl");
    let cmdText = cmds.join(" ");
    state.LOG("Batch Command:", json, ">", cmdText);
    let reo = await Wn.Sys.exec2(cmdText, { input: json, as: "json" });
    state.LOG("Batch Result", reo);

    let isError = reo instanceof Error;

    if (!isError && _.isArray(reo)) {
      for (let it of reo) {
        if (state.meta && state.meta.id == it.id) {
          commit("setMeta", it);
        }
        commit("setListItem", it);
      }
    }

    // Recover field status
    Wn.Util.setFieldStatusAfterUpdate({ commit }, uniqKey, reo);
    _.forEach(data, (_, name) => {
      Wn.Util.setFieldStatusAfterUpdate({ commit }, name, reo);
    });
  },
  //--------------------------------------------
  //
  //  Content About
  //
  //--------------------------------------------
  async parseContentData({ state, commit, getters }) {
    try {
      let content = state.content;
      let contentType = state.contentType;

      // Eval mime
      if ("<MIME>" == contentType) {
        let pathInfo = getters.contentLoadInfo || {};
        let { path, mime } = pathInfo;
        if (!mime) {
          if ("<self>" == path) {
            contentType = _.get(state, "meta.mime");
          }
          // Load mime from server side
          else {
            let type = Ti.Util.getSuffixName(path);
            if (type) {
              mime = await Wn.Sys.exec2(`o @mime ${type} -as value`);
              contentType = _.trim(mime);
            }
            // Use text plain
            else {
              contentType = "text/plain";
            }
          }
        }
        // Use mime
        else {
          contentType = mime;
        }
      }

      state.LOG("parseContentData", contentType);

      let contentData = null;
      if (/^(application|text)\/json$/.test(contentType)) {
        let str = _.trim(content);
        contentData = JSON.parse(str || null);
        state.LOG("parseContentData -> ", contentData);
      }
      commit("setContentData", contentData);
    } catch (E) {
      if (!state.contentQuietParse) {
        throw E;
      }
    }
  },
  //--------------------------------------------
  changeContent({ commit, dispatch }, payload) {
    commit("setContent", payload);
    commit("syncStatusChanged");

    // Try parse content
    dispatch("parseContentData");
  },
  //----------------------------------------
  updateContent({ commit, getters, dispatch }, content) {
    commit("setContent", content);
    commit("setSavedContent", content);
    commit("syncStatusChanged");

    // Try parse content
    dispatch("parseContentData");
  },
  //--------------------------------------------
  async saveContent({ state, commit, getters }) {
    //console.log("saveContent")
    // Guard: ing
    if (state.status.saving || !state.status.changed) {
      return;
    }

    // Which content should I load?
    let path = getters.contentLoadPath;
    if (!path) {
      return;
    }
    let meta = await getContentMeta(state, getters.contentLoadPath);

    // Guard
    if (!meta) {
      return await Ti.Toast.Open("saveContent nil Meta!");
    }

    // Do save content
    commit("setStatus", { saving: true });

    let content = state.content;
    let newMeta = await Wn.Io.saveContentAsText(meta, content);

    commit("setStatus", { saving: false });
    if ("<self>" == path) {
      commit("setMeta", newMeta);
    }
    commit("setSavedContent", content);
    commit("syncStatusChanged");

    // return the new meta
    return newMeta;
  }
  //--------------------------------------------
};
export default _M;
