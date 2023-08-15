////////////////////////////////////////////////
const _M = {
  //----------------------------------------
  async exportData({ state, commit, dispatch, getters }, exportDirPath) {
    exportDirPath =
      exportDirPath ||
      _.get(state, "oDir.export_target") ||
      _.get(state, "exportSettings.outputTarget");

    state.LOG("exportDate", exportDirPath);
    // Guard
    if (!getters.isCanUpdate) {
      return await Ti.Alert("i18n:e-pvg-fobidden", { type: "warn" });
    }
    if (!state.dirId) {
      return await Ti.Toast.Open("ThObj dirId without defined", "warn");
    }

    let modes = ["current", "scope", "all"];
    let ids = Ti.Util.getTruthyKeyInArray(state.checkedIds);
    if (!_.isEmpty(ids)) {
      modes.splice(0, 0, "checked");
    }

    //console.log(modes);
    let dirName = Ti.Util.getFallback(state.oDir, "title", "nm") || "export";
    let dirTitle = Ti.I18n.text(dirName);

    // Settings
    let settings = _.cloneDeep(state.exportSettings) || {};
    _.defaults(settings, {
      "defaultMappingName": undefined,
      "outputName": `${dirTitle}-\${now}`,
      "outputTarget": `~/.tmp/obj_export/${state.dirId}/\${name}.\${type}`,
      "outputModeOptions": modes,
      "outputMode": _.first(modes)
    });
    if (state.oDir) {
      if (state.oDir.export_mapping) {
        settings.mappingPath = state.oDir.export_mapping;
      }
    }
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
    re.outputPath = Ti.Util.appendPath(exportDirPath, re.name);
    state.LOG("Export To:", re.outputPath);

    let _gen_command = {
      //.....................................
      //
      //             As XLSX
      //
      //.....................................
      xlsx: async ({ mode, scope, mapping, fields = [], outputPath } = {}) => {
        let cmds = [`o id:${state.dirId} @query`];

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
          let sum = _.get(state, "pager.sum") || 100000;
          if (sum > 1000) {
            if (
              !(await Ti.Confirm("i18n:wn-export-confirm-many", {
                type: "warn"
              }))
            ) {
              return;
            }
          }
          // if limit is 0 mean unlimited, so we just give it a big number, such as 10W
          cmds.push(`-limit ${sum}`);
        }
        //.........................
        // Invalid Mode
        else {
          throw Ti.Err.make("e.export_data.UnknownMode", mode);
        }
        state.LOG("Export Filter Input", fltInput);

        // Prepare the fields for thing query
        let fldReg = _.isEmpty(fields) ? null : `^(${fields.join("|")})$`;
        if (fldReg) {
          cmds.push(`@json '${fldReg}' -cqnl`);
        } else {
          cmds.push(`@json -cqnl`);
        }

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
      state.LOG("Export Data:", cmdText, input, outputPath);
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
    // ? Load current content
    if (getters.contentLoadPath) {
      await dispatch("loadContent");
    }
  },
  //----------------------------------------
  //
  // Filter / Sorter / Pager
  //
  //----------------------------------------
  async applyFilter({ commit, getters, dispatch }, filter) {
    //console.log("applyFilter", filter)
    commit("setFilter", filter);
    // If pager enabled, should auto jump to first page
    if (getters.isPagerEnabled) {
      let pnKey = getters.isLongPager ? "pageNumber" : "pn";
      commit("assignPager", { [pnKey]: 1 });
    }
    await dispatch("queryList");
  },
  //----------------------------------------
  async applySorter({ commit, dispatch }, sorter) {
    //console.log("applySorter", sorter)
    commit("setSorter", sorter);
    await dispatch("queryList");
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
  async reloadCheckedItems({ commit, state }) {
    let ids = Ti.Util.getTruthyKeyInMap(state.checkedIds);
    if (_.isEmpty(ids)) {
      return;
    }
    let cmds = ["o"];
    for (let id of _.keys(ids)) {
      cmds.push(`@get ${id}`);
    }
    cmds.push("@json -cqnl");
    let cmdText = cmds.join(" ");
    let oItems = await Wn.Sys.exec2(cmdText, { as: "json" });
    if (!_.isEmpty(oItems)) {
      for (let it of oItems) {
        commit("setListItem", it);
      }
    }
  },
  //----------------------------------------
  async reloadList({ dispatch }) {
    return await dispatch("queryList");
  },
  async queryList({ state, commit, getters, rootState }) {
    let { dirId, filter, fixedMatch, sorter, objKeys } = state;
    // Query
    let input = JSON.stringify(_.assign({}, filter, fixedMatch));
    let exposeHidden = _.get(rootState, "viewport.exposeHidden");

    // Command
    let cmds = [`o 'id:${dirId}' @query`];

    if (exposeHidden) {
      cmds.push("-hidden");
    }

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
    if (objKeys) {
      cmds.push(`@json '${objKeys}' -cqnl`);
    }
    // Output as json
    else {
      cmds.push("@json -cqnl");
    }

    // Process Query
    let cmdText = cmds.join(" ");
    commit("setStatus", { reloading: true });
    let reo = await Wn.Sys.exec2(cmdText, { input, as: "json" });

    // Update pager
    if (getters.isPagerEnabled) {
      commit("setPager", reo.pager);
    }
    commit("setList", reo.list);
    commit("setCurrentMeta");

    commit("setStatus", { reloading: false });
  }
  //--------------------------------------------
};
export default _M;
