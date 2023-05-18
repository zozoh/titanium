////////////////////////////////////////////////
const _M = {
  //----------------------------------------
  //
  // Export Data
  //
  //----------------------------------------
  async openExportDataDir({ getters }) {
    let taDir = getters.exportDataDir;
    let oDir = await Wn.Io.loadMeta(taDir);
    let link = Wn.Util.getAppLink(oDir);
    Ti.Be.Open(link.url, { params: link.params });
  },
  //----------------------------------------
  async exportData({ state, commit, dispatch, getters }) {
    // Guard
    if (!getters.isCanUpdate) {
      return await Ti.Alert("i18n:e-pvg-fobidden", { type: "warn" });
    }
    if (!state.thingSetId) {
      return await Ti.Toast.Open("ThObj thingSetId without defined", "warn");
    }

    let modes = ["current", "scope", "all"];
    let ids = Ti.Util.getTruthyKeyInArray(state.checkedIds);
    if (!_.isEmpty(ids)) {
      modes.splice(0, 0, "checked");
    }

    //console.log(modes);
    let tsName = Ti.Util.getFallback(state.oTs, "title", "nm") || "export";
    let tsTitle = Ti.I18n.text(tsName);

    // Settings
    let settings = _.cloneDeep(state.exportSettings) || {};
    _.defaults(settings, {
      "mappingPath": `id:${state.thingSetId}/export/`,
      "defaultMappingName": undefined,
      "outputName": `${tsTitle}-\${now}`,
      "outputTarget": `id:${state.thingSetId}/tmp/export/\${name}.\${type}`,
      "outputModeOptions": modes,
      "outputMode": _.first(modes)
    });
    settings = Ti.Util.explainObj(state, settings);
    state.LOG("export settings:", settings);

    // Open Dialog Wizard to export data
    let re = await Ti.App.Open({
      icon: "fas-file-download",
      title: "i18n:export-data",
      position: "top",
      minWidth: "90%",
      height: "90%",
      result: settings,
      model: { event: "change", prop: "data" },
      comType: "WnDataExporterForm",
      comConf: settings,
      components: ["@com:wn/data/exporter-form"]
    });

    // User Cancel
    if (!re) {
      return;
    }
    state.LOG("Export Data By:", re);

    // Prepare command
    /*
    expi: "1d",
    fields: ['title', 'con_name', 'con_phone', 'con_email'],
    mapping: "0678suw2...",
    mode: "checked"
    name: "export-2023-02-28_101858"
    type: "xlsx|json"
    */
    let { type, expi } = re;
    re.outputPath = Ti.Util.appendPath(getters.exportDataDir, re.name);
    state.LOG("Export To:", re.outputPath);

    let _gen_command = {
      //.....................................
      //
      //             As XLSX
      //
      //.....................................
      xlsx: async ({
        mode,
        scope,
        mapping,
        fields = [],
        outputPath,
        expi
      } = {}) => {
        let cmds = [`thing id:${state.thingSetId} query -cqn`];

        // Prepare the fields for thing query
        let fldReg = _.isEmpty(fields) ? null : `^(${fields.join("|")})$`;
        if (fldReg) {
          cmds.push(`-e '${fldReg}'`);
        }

        // Eval Sorter
        if (!_.isEmpty(state.sorter)) {
          let sort = JSON.stringify(state.sorter);
          cmds.push(`-sort '${sort}'`);
        }

        //
        // Filter Condition
        //
        let fltInput = JSON.stringify(
          _.assign({}, state.filter, state.fixedMatch)
        );

        //.........................
        // Current Page
        if ("current" == mode) {
          let limit = getters.searchPageSize || 1000;
          let skip = Math.max(limit * (getters.searchPageNumber - 1), 0);
          cmds.push(`-limit ${limit}`);
          cmds.push(`-skip  ${skip}`);
        }
        //.........................
        // Scope
        else if ("scope" == mode) {
          let { skip, limit } = Ti.Num.scopeToLimit(scope);

          if (limit > 1000) {
            if (
              !(await Ti.Confirm("i18n:wn-export-confirm-many", {
                type: "warn"
              }))
            ) {
              return;
            }
          }

          cmds.push(`-limit ${limit}`);
          cmds.push(`-skip  ${skip}`);
        }
        //.........................
        // Checked ids
        else if ("checked" == mode) {
          fltInput = JSON.stringify({
            id: Ti.Util.getTruthyKeyInArray(state.checkedIds)
          });
        }
        //.........................
        // All
        else if ("all" == mode) {
          // Do nothing
        }
        //.........................
        // Invalid Mode
        else {
          throw Ti.Err.make("e.export_data.UnknownMode", mode);
        }
        state.LOG("Export Filter Input", fltInput);

        // Join the export
        cmds.push('| sheet -process "<auto>" -tpo xlsx');
        if (fldReg) {
          cmds.push(`-keys '${fldReg}'`);
        }

        // Mapping data
        if (mapping) {
          cmds.push(`-mapping id:${mapping}`);
        }

        // Join output path
        outputPath = `${outputPath}.xls`;
        cmds.push(`-out '${outputPath}';\n`);

        return {
          cmdText: cmds.join(" "),
          input: fltInput,
          outputPath
        };
      }
      //.....................................
      //
      //             As JSON
      //
      //.....................................
      //json: async (mode, scope, mapping, fields = []) => {},
    }[type];

    if (!_.isFunction(_gen_command)) {
      return await Ti.Alert("i18n:wn-export-c-type-unknown", { type: "warn" });
    }

    // Then Generated the command
    let cmdText, input, outputPath;
    try {
      let gre = await _gen_command(re);

      // Save Settings
      commit("assignExportSettings", re);

      // Get Return Params
      cmdText = gre.cmdText;
      input = gre.input;
      outputPath = gre.outputPath;
      state.LOG("Export Data:", cmdText);
    } catch (E) {
      // Fail to Generate the command
      Ti.Alert(E.toString() || "Some Erro Happend IN Gen Command", {
        type: "error"
      });
      throw E;
    }

    // User cancel
    if (!cmdText) {
      return;
    }

    // Process command
    commit("setStatus", {
      doing: {
        icon: "zmdi-settings fa-spin",
        text: `i18n:wn-export-ing-tip`
      }
    });

    let oOut;
    try {
      re = await Wn.Sys.exec2(cmdText, { input });
      state.LOG("output done ", re);

      // Fetch back the outputFile
      let cmds = [`o '${outputPath}'`];
      if (expi) {
        cmds.push(`@update 'expi:"%ms:now+${expi}"'`);
      }
      cmds.push("@json -cqn");
      cmdText = cmds.join(" ");
      state.LOG("Get back ouput file ", cmdText);
      oOut = await Wn.Sys.exec2(cmdText, { as: "json" });
    } finally {
      // Clean the status
      commit("setStatus", { doing: false });
    }

    // Tip Done
    state.LOG("Get Back Output", oOut);
    let isOK = oOut && !(oOut instanceof Error) ? true : false;
    await Ti.App.Open({
      title: "i18n:wn-export-done",
      type: isOK ? "success" : "error",
      position: "top",
      width: "4.8rem",
      height: "5rem",
      textOk: null,
      textCancel: "i18n:close",
      result: oOut,
      comType: "WebMetaBadge",
      comConf: {
        className: isOK ? "is-success" : "is-error",
        value: oOut,
        icon: isOK ? "fas-check-circle" : "zmdi-alert-triangle",
        title: isOK ? "i18n:wn-export-done-ok" : "i18n:wn-export-done-fail",
        brief: isOK
          ? "i18n:wn-export-done-ok-tip"
          : "i18n:wn-export-done-fail-tip",
        links: isOK
          ? [
              {
                icon: "fas-download",
                text: ":=nm",
                href: ":->/o/content?str=id:${id}&d=true",
                newtab: true
              },
              {
                icon: "fas-external-link-alt",
                text: "i18n:wn-export-open-dir",
                href: Wn.Util.getAppLink(oOut.pid),
                newtab: true
              }
            ]
          : []
      },
      components: ["@com:web/meta/badge"]
    });
  },
  //----------------------------------------
  //
  // Import Data
  //
  //----------------------------------------
  async importData({ state, commit, dispatch, getters }) {
    // Guard
    if (!getters.isCanUpdate) {
      return await Ti.Alert("i18n:e-pvg-fobidden", { type: "warn" });
    }
    if (!state.thingSetId) {
      return await Ti.Toast.Open("ThObj thingSetId without defined", "warn");
    }
    let {
      defaultMappingName,
      mappingPath,
      uploadTarget,
      uniqKey,
      withHook,
      process
    } = state.importSettings || {};

    let reo = await Ti.App.Open({
      icon: "fas-file-import",
      title: "i18n:import-data",
      position: "top",
      minWidth: "90%",
      height: "90%",
      result: _.cloneDeep(state.importSettings) || {},
      model: { event: "change", prop: "data" },
      comType: "WnDataImporterForm",
      comConf: {
        "mappingPath": mappingPath || `id:${state.thingSetId}/import/`,
        "defaultMappingName": defaultMappingName,
        "uploadTarget": uploadTarget || `id:${state.thingSetId}/tmp/import/`
      },
      components: ["@com:wn/data/importer-form"]
    });

    // User Cancel
    if (!reo) {
      return;
    }

    let { fileId, mode, scope, fields, mapping } = reo;
    // Check Import File
    if (!fileId) {
      return await Ti.Alert("i18n:wn-import-WithoutInput", { type: "warn" });
    }

    // Check data Scope
    let { skip, limit } = Ti.Num.scopeToLimit(scope, { skip: 0, limit: 0 });
    if (limit > 1000) {
      if (
        !(await Ti.Confirm("i18n:wn-import-confirm-many", {
          type: "warn"
        }))
      ) {
        return;
      }
    }

    // Check filtering fields
    let fldReg = _.isEmpty(fields) ? null : `^(${fields.join("|")})$`;
    let fnames = fldReg ? `-names '${fldReg}'` : "";

    // From settings
    let unique = uniqKey ? `-unique ${uniqKey}` : "";
    let nohook = withHook ? "" : "-nohook";

    // Generate import commands
    var cmds = [
      "ooml id:" + fileId,
      `@xlsx @sheet @mapping -f 'id:${mapping}' ${fnames} -only`,
      "@beans -limit " + limit + " -skip " + skip,
      `| thing 'id:${state.thingSetId}' create -fields ${unique} ${nohook} `,
      `-process '${process || "<auto>"}'`
    ];
    let cmdText = cmds.join(" ");
    //console.log(cmdText);

    // Process in Command panel
    await Wn.OpenCmdPanel(cmdText, {
      title: "i18n:import-data"
    });

    // 刷新主界面
    await this.dispatch("main/reloadData");
  },
  //----------------------------------------
  //
  // RecycelBin
  //
  //----------------------------------------
  async toggleInRecycleBin({ state, commit, dispatch }) {
    // Toggle filter
    let flt;
    if (-1 == _.get(state.filter, "th_live")) {
      flt = _.omit(state.filter, "th_live");
    } else {
      flt = _.assign({}, state.filter, { th_live: -1 });
    }
    commit("setFilter", flt);

    // Reload Search
    await dispatch("queryList");
  },
  //----------------------------------------
  async cleanRecycleBin({ state, commit, dispatch, getters }) {
    commit("setStatus", { cleaning: true });

    // Run command
    let th_set = state.thingSetId;
    let cmdText = `thing ${th_set} clean -limit 3000`;
    await Wn.Sys.exec2(cmdText);

    commit("setStatus", { cleaning: false });

    if (getters.isInRecycleBin) {
      await dispatch("queryList");
    }
  },
  //----------------------------------------
  async restoreRecycleBin({ state, commit, dispatch }) {
    // Require user to select some things at first
    let ids = state.checkedIds;
    if (!_.isArray(ids)) {
      ids = Ti.Util.truthyKeys(ids);
    }
    if (_.isEmpty(ids)) {
      return await Ti.Alert("i18n:thing-restore-none");
    }
    commit("setStatus", { restoring: true });

    // Run command
    let th_set = state.thingSetId;
    let cmdText = `thing ${th_set} restore -quiet -cqn -l ${ids.join(" ")}`;
    await Wn.Sys.exec2(cmdText, { as: "json" });

    // Reload
    await dispatch("queryList");

    // Update current
    dispatch("selectMeta", { currentId: null, checkedIds: {} });

    commit("setStatus", { restoring: false });
  },
  //----------------------------------------
  //
  // Selection
  //
  //----------------------------------------
  async selectMeta(
    { state, commit, dispatch, getters },
    { currentId = null, checkedIds = {} } = {}
  ) {
    state.LOG("selectMeta", currentId, checkedIds);
    // If current is nil but we got the chekced
    // just pick one as the meta
    if (!currentId && !_.isEmpty(checkedIds)) {
      currentId = _.first(Ti.Util.truthyKeys(checkedIds));
    } else if (currentId && _.isEmpty(checkedIds)) {
      checkedIds = [currentId];
    }
    commit("setCurrentId", currentId);
    commit("setCheckedIds", checkedIds);
    // find <meta> by currentId from <list>
    commit("setCurrentMeta");
    // eval data home by <meta>
    commit("autoDataHome");
    // ? Load current content
    if (getters.contentLoadPath) {
      await dispatch("loadContent");
    }
    // ? Load current data dir
  },
  //----------------------------------------
  //
  // Filter / Sorter / Pager
  //
  //----------------------------------------
  async applySearch({ state, commit, getters, dispatch }, { filter, sorter }) {
    console.log("applySearch", {filter, sorter})
    if (filter) {
      commit("setFilter", filter);
    }
    if (sorter) {
      commit("setSorter", sorter);
    }
    // If pager enabled, should auto jump to first page
    if (getters.isPagerEnabled && filter) {
      commit("assignPager", { pn: 1 });
    }
    // Reload data by new search condition
    await dispatch("queryList");
    // Reload AGG
    if (state.aggAutoReload && filter) {
      await dispatch("queryAggResult");
    }
  },
  //----------------------------------------
  async applyFilter({ state, commit, getters, dispatch }, filter) {
    await dispatch("applySearch", { filter });
  },
  //----------------------------------------
  async applySorter({ commit, dispatch }, sorter) {
    await dispatch("applySearch", { sorter });
  },
  //----------------------------------------
  async applyPager({ commit, dispatch }, pager) {
    //console.log("applyPager", pager)
    commit("assignPager", pager);
    await dispatch("queryList");
  },
  //----------------------------------------
  //
  // Query
  //
  //----------------------------------------
  async loadAggResult({ dispatch }) {
    return await dispatch("queryAggResult");
  },
  //----------------------------------------
  async queryAggResult(
    { state, commit },
    { aggName, flt = {}, dft = [] } = {}
  ) {
    aggName = aggName || state.aggQuery;
    if (!aggName) {
      return dft;
    }
    state.LOG("async queryAggResult", aggName);
    let agg = _.get(state.agg, aggName);
    if (_.isEmpty(agg) || !agg.by) {
      state.LOG("!! Bad Agg Setting", agg);
      return;
    }

    // Ignore the specil keys in filter to agg more data
    let ignore = Ti.AutoMatch.parse(agg.ignore);
    let { thingSetId, filter, fixedMatch } = state;
    // Query
    let qmeta = _.assign({}, filter, fixedMatch, flt);
    qmeta = _.omitBy(qmeta, (v, k) => {
      return ignore(k);
    });
    _.assign(qmeta, agg.match);
    let input = JSON.stringify(qmeta);

    // Prepare the command
    commit("setStatus", { reloading: true });
    let cmdText = `o id:${thingSetId}/index @agg ${agg.by} -match -cqn`;
    let reo = await Wn.Sys.exec2(cmdText, { input, as: "json" });

    // Update
    commit("setAggResult", { key: aggName, result: reo });
    // Done
    commit("setStatus", { reloading: false });
  },
  //----------------------------------------
  async reloadList({ dispatch }) {
    return await dispatch("queryList");
  },
  //----------------------------------------
  async queryList({ state, commit, getters }, flt = {}) {
    state.LOG("async queryList");
    let { thingSetId, filter, fixedMatch, sorter, thingObjKeys } = state;
    // Query
    let qmeta = _.assign({}, filter, fixedMatch, flt);
    let input = JSON.stringify(qmeta);

    // Command
    let cmds = [`thing ${thingSetId} query -cqn`];

    // Eval Pager
    if (getters.isPagerEnabled) {
      let limit = getters.searchPageSize * 1;
      let skip = getters.searchPageSize * (getters.searchPageNumber - 1);
      cmds.push(`-pager -limit ${limit} -skip ${skip}`);
    }

    // Sorter
    if (!_.isEmpty(sorter)) {
      cmds.push(`-sort '${JSON.stringify(sorter)}'`);
    }

    // Show Thing Keys
    if (thingObjKeys) {
      cmds.push(`-e '${thingObjKeys}'`);
    }

    // Process Query
    let cmdText = cmds.join(" ");
    commit("setStatus", { reloading: true });
    let reo = await Wn.Sys.exec2(cmdText, { input, as: "json" });

    state.LOG(" - ", cmdText, input);

    // Update pager
    if (getters.isPagerEnabled) {
      commit("setPager", reo.pager);
    }
    commit("setList", reo.list);
    commit("setCurrentMeta");

    commit("setStatus", { reloading: false });
    state.LOG(" - query done:", reo);
  }
  //--------------------------------------------
};
export default _M;
