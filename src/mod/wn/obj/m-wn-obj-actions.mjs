////////////////////////////////////////////////
async function loadConfigJson(state, key, dft) {
  let path;
  if (state.meta) {
    path = state.meta[`gui_${key}`];
  }
  if (!path && state.oDir) {
    path = state.oDir[`gui_${key}`];
  }
  if (!path) {
    path = state[`${key}Path`];
  }

  // Guard nil path
  if (!path) {
    return dft;
  }

  // Try load
  let re = await Wn.Sys.exec(`cat ${path}`);
  re = _.trim(re);

  // Not exists
  if (!re || /^e\./.test(re)) {
    return dft;
  }

  // Load schema
  return JSON.parse(re);
}
////////////////////////////////////////////////
const _M = {
  //--------------------------------------------
  applyViewBeforeLoad({ state, commit }) {
    // Guard
    if (!state.view) {
      return;
    }
    state.LOG("applyViewBeforeLoad", state.view);
    // Update to state
    _.forEach(state.view, (v, k) => {
      // Only set the paths
      if (/^((actions|layout|schema|method)Paths?)$/.test(k)) {
        let by = _.camelCase("set-" + k);
        state.LOG("  > ", by, v);
        commit(by, v);
      }
    });
  },
  //--------------------------------------------
  applyViewAfterLoad({ state, commit }) {
    // Guard
    if (!state.view) {
      return;
    }
    state.LOG("applyViewAfterLoad", state.view);
    // Update to state
    _.forEach(state.view, (v, k) => {
      // Ignore
      if (/^((actions|layout|schema|method)Paths?)$/.test(k)) {
        return;
      }
      if (
        /^(events|view|path|lbkOff|dirId|oDir|meta|(__saved_)?content)$/.test(k)
      ) {
        return;
      }
      // Schema merged in "loadSchema" already
      if (/^(schema|components)$/.test(k)) {
        return;
      }
      let by;
      // Assign
      if (/^(pager)$/.test(k)) {
        by = _.camelCase("assign-" + k);
      }
      // Others set
      else {
        by = _.camelCase("set-" + k);
      }
      // Update state by view
      commit(by, v);
    });
  },
  //--------------------------------------------
  async loadContent(
    { state, commit, dispatch, getters },
    { quiet = false } = {}
  ) {
    // Which content should I load?
    let path = getters.contentLoadPath;
    if (!path) {
      return;
    }

    let meta;
    if (!quiet) {
      commit("setStatus", { reloadContent: true });
    }

    if ("<self>" != path) {
      meta = await Wn.Io.loadMeta(path);
    }
    // Use state
    else if (state.meta && "FILE" == state.meta.race) {
      meta = state.meta;
    }

    //console.log("load Content:", path)
    // No meta
    if (!meta) {
      state.LOG("updateContent => null");
      dispatch("updateContent", null);
      if (!quiet) {
        commit("setStatus", { reloadContent: false });
      }
      return;
    }

    // Load meta content
    state.LOG("loadContent", meta.ph || meta.nm);
    let content = await Wn.Io.loadContent(meta);
    dispatch("updateContent", content);
    //console.log("loadContent:", meta,content)

    // All done
    if (!quiet) {
      commit("setStatus", { reloadContent: false });
    }

    return content;
  },
  //--------------------------------------------
  async loadSchema({ state, commit }) {
    state.LOG(" - loadSchema");
    let schema = await loadConfigJson(state, "schema", {});
    let components = [];

    // Load extends components
    if (!_.isEmpty(schema.components)) {
      components = _.concat(components, schema.components);
    }

    // Load extends components
    if (!_.isEmpty(components)) {
      await Ti.App.topInstance().loadView({ components });
    }

    //console.log("setSchema", schema)
    // Should set scheme after All deps components preloaded
    commit("setSchema", schema);

    if (schema.methods) {
      commit("setMethodPaths", schema.methods);
    }

    if (schema.localBehaviorKeepAt) {
      commit("setLocalBehaviorKeepAt", schema.localBehaviorKeepAt);
    }

    let contentPath = _.get(schema, "behavior.contentPath");
    if (contentPath) {
      commit("setContentPath", contentPath);
    }
  },
  //--------------------------------------------
  async loadLayout({ state, commit }) {
    state.LOG(" > loadLayout");
    let reo = await loadConfigJson(state, "layout", {});
    commit("setLayout", reo);
  },
  //--------------------------------------------
  async loadObjActions({ state, commit }) {
    state.LOG(" > loadActions");
    let reo = await loadConfigJson(state, "actions", null);
    commit("setObjActions", reo);
  },
  //--------------------------------------------
  async loadObjMethods({ state, commit }) {
    state.LOG(" > loadMethods", state.methodPaths);

    let path;
    if (state.meta) {
      path = state.meta.methods;
    }
    if (!path && state.oDir) {
      path = state.oDir.methods;
    }
    if (!path) {
      path = state.methodPaths;
    }

    let reo = {};
    // Load
    if (path) {
      //let methodsUri = `./${state.methodPaths}`
      let methods = await Ti.Load(path, {
        dynamicAlias: new Ti.Config.AliasMapping({
          "^./": `/o/content?str=id:${state.dirId}/`
        })
      });
      // Merge methods
      if (_.isArray(methods)) {
        for (let mt of methods) {
          _.assign(reo, mt);
        }
      } else {
        _.assign(reo, methods);
      }
    }

    // Done
    commit("setObjMethods", reo);
  },
  //--------------------------------------------
  loadDirId({ state, commit }) {
    let meta = state.meta;
    if (!meta) {
      return;
    }
    if ("DIR" == meta.race) {
      commit("setDirId", meta.id);
    } else {
      commit("setDirId", meta.pid);
    }
  },
  //--------------------------------------------
  applyBehavior({ state, commit }, be = {}) {
    // Eval behavior dynamicly
    let {
      pvg,
      filter,
      sorter,
      match,
      exportSettings,
      importSettings,
      currentId,
      checkedIds,
      pageSize,
      guiShown
    } = be;

    // Apply Pvg
    if (!_.isEmpty(pvg)) {
      commit("assignPvg", pvg);
    }

    // Apply filter
    if (!_.isEmpty(filter)) {
      commit("setFilter", filter);
    }

    // Apply sorter
    if (!_.isEmpty(sorter)) {
      commit("setSorter", sorter);
    }

    // Import/export
    if (exportSettings) {
      commit("assignExportSettings", exportSettings);
    }
    if (importSettings) {
      commit("assignImportSettings", importSettings);
    }

    // Apply fixed match
    if (!_.isEmpty(match)) {
      commit("setFixedMatch", match);
    }

    // Checked and current
    if (!Ti.Util.isNil(currentId)) {
      commit("setCurrentId", currentId);
    }
    if (!_.isEmpty(checkedIds)) {
      commit("setCheckedIds", checkedIds);
    }

    // Apply shown
    if (!_.isEmpty(guiShown)) {
      commit("setGuiShown", guiShown);
    }

    // Apply pager
    let pager = {};
    if (pageSize > 0) {
      pager.pn = 1;
      pager.pgsz = pageSize;
    }
    commit("assignPager", pager);
  },
  //--------------------------------------------
  updateSchemaBehavior({ state, commit, dispatch }) {
    let be = _.get(state.schema, "behavior") || {};
    be = Ti.Util.explainObj(state, be);
    if (!_.isEmpty(be)) {
      commit("setLbkOff");
      dispatch("applyBehavior", be);
      commit("setLbkOn");
    }
  },
  //--------------------------------------------
  restoreLocalBehavior({ state, dispatch }) {
    // Guard
    if (!state.lbkAt) {
      return;
    }
    // Load local setting
    let be = Ti.Storage.local.getObject(state.lbkAt);
    if (!_.isEmpty(be)) {
      dispatch("applyBehavior", be);
    }
  },
  //--------------------------------------------
  async reloadData({ state, dispatch, getters }) {
    if (state.oDir) {
      await dispatch("queryList");
    }
    if (getters.contentLoadPath) {
      await dispatch("loadContent");
    }
  },
  //--------------------------------------------
  /***
   * Reload All
   */
  async reload({ state, commit, dispatch }, meta) {
    //console.log("+++reload", state.moduleName)
    // Guard
    if (
      state.status.reloading ||
      state.status.saving ||
      state.status.deleting
    ) {
      return;
    }
    state.LOG = () => {};
    // if ("casedocs" == state.moduleName) {
    //   state.LOG = console.log;
    // }
    state.LOG(">>>>>>>>>>>>>> reload", meta, state.status.reloading);
    // If meta like : {path: "/path/to", quiet:true}
    let quiet = false;
    if (meta && meta.path && !Ti.Util.isNil(meta.quiet)) {
      quiet = meta.quiet;
      meta = meta.path;
    }

    // Guard
    if (_.isString(meta)) {
      meta = await Wn.Io.loadMeta(meta);
    }

    // Guard: Nil meta
    if (!meta) {
      if (!quiet) {
        await Ti.Toast.Open("Nil Meta", "warn");
      }
      return;
    }
    if (!meta.id) {
      if (!quiet) {
        await Ti.Toast.Open("Meta without ID", "warn");
      }
      return;
    }
    // Analyze meta : oDir
    state.LOG("Analyze oDir and dirId");
    if ("DIR" == meta.race) {
      commit("setDir", meta);
      commit("setDirId", meta.id);
    }
    // Take the file as GUI View
    else if ("gui_view" == meta.tp && "FILE" == meta.race) {
      let view = await Wn.Io.loadContent(meta, { as: "json" });
      commit("setView", view);
      if (view.path) {
        let oDir = await Wn.Io.loadMeta(view.path);
        commit("setDir", oDir);
        commit("setDirId", oDir.id);
      }
    }
    // Then meta should be a File
    else {
      // CheckThingSet ID
      commit("setMeta", meta);
      commit("setDirId", meta.pid);
      //dispatch("loadDirId")
    }

    if (!state.dirId) {
      return await Ti.Alert("Meta Without DirID: " + meta.id, { type: "warn" });
    }

    commit("setStatus", { reloading: true });

    // Reload Configurations
    state.LOG("<-------- Reload Config -------->");
    dispatch("applyViewBeforeLoad");
    await dispatch("loadSchema");
    await Promise.all([
      dispatch("loadLayout"),
      dispatch("loadObjActions"),
      dispatch("loadObjMethods")
    ]);
    dispatch("applyViewAfterLoad");
    state.LOG("<-------- Config Loaded-------->");

    // Behavior
    commit("explainLocalBehaviorKeepAt");
    dispatch("updateSchemaBehavior");
    dispatch("restoreLocalBehavior");

    // Reload thing list
    state.LOG(" >> Reload Data ...");
    await dispatch("reloadData");

    // All done
    commit("setStatus", { reloading: false });
    state.LOG("<<<<<<<<<<<<<<<< done for reload");
  }
  //--------------------------------------------
};
export default _M;
