export default {
  //--------------------------------------------
  async invoke(fnName, ...args) {
    //console.log("invoke ", fnName, args)
    let fn = _.get(this.objMethods, fnName)
    // Invoke the method
    if (_.isFunction(fn)) {
      return await fn.apply(this, args)
    }
    // Throw the error
    else {
      throw Ti.Err.make("e.thing.fail-to-invoke", fnName)
    }
  },
  //--------------------------------------------
  //
  // Export
  //
  //--------------------------------------------
  async openDataDir(target) {
    let taDir = target || `id:${this.dirId}`
    let oDir = await Wn.Io.loadMeta(taDir)
    let link = Wn.Util.getAppLink(oDir)
    Ti.Be.Open(link.url, { params: link.params })
  },
  //--------------------------------------------
  async exportDataByModes(mode = "csv;xls;json", target) {
    await this.exportData({ target, mode })
  },
  //--------------------------------------------
  async exportData({
    target,
    mode = "xls;csv;json",
    page = "checked;current;all",
    name = "${title|nm}-${time}",
    mappingDir
  } = {}) {
    // Guard
    if (!this.oDir) {
      throw `ExportData[${this.dirId}] without oDir`
    }
    if (!target) {
      throw `ExportData[${this.dirId}] without target`
    }
    //............................................
    // Guard mapping dir
    mappingDir = mappingDir
      || _.get(this.oDir, "mapping_dir")
      || this.mappingDirPath
    if (!mappingDir) {
      throw `ExportData[${this.dirId}] without mappingDir`
    }
    //............................................
    let taDir = target
    //............................................
    // Eval default export name
    let enVars = {
      ...this.oDir,
      title: Ti.I18n.text(this.oDir.title || this.oDir.nm),
      time: Ti.DateTime.format(new Date(), 'yyyy-MM-dd_HHmmss')
    }
    let exportName = Ti.S.renderBy(name, enVars)
    //console.log(exportName)
    //............................................
    // Try load export mapping template
    let phMappingDir = Ti.S.renderBy(mappingDir, this.oDir)
    let oMappingDir = await Wn.Io.loadMeta(phMappingDir)
    let oMapplingItems = []
    if (oMappingDir) {
      oMapplingItems = (await Wn.Io.loadChildren(oMappingDir)).list;
    }
    //............................................
    // The checked id list
    let checkedIds = Ti.Util.truthyKeys(this.checkedIds)
    //............................................
    // Prepare the result
    let result = {
      mode: "xls",
      page: _.isEmpty(checkedIds) ? "current" : "checked",
      limit: 1000,
      name: exportName,
      expiIn: 3,
      fltInput: null,
      cmdText: undefined,
      outPath: undefined,
      target: undefined
    }
    //............................................
    // Eval modes options
    let modeNames = mode.split(";")
    let modeMap = {
      xls: { value: "xls", text: "i18n:wn-export-c-mode-xls" },
      csv: { value: "csv", text: "i18n:wn-export-c-mode-csv" },
      json: { value: "json", text: "i18n:wn-export-c-mode-json" },
      zip: { value: "zip", text: "i18n:wn-export-c-mode-zip" }
    }
    let modeOptions = []
    _.forEach(modeNames, nm => {
      if (modeMap[nm])
        modeOptions.push(modeMap[nm])
    })
    //result.mode = _.first(modeOptions).value
    //............................................
    // Eval page options
    let pageModes = page.split(";")
    let pageMap = {
      checked: { value: "checked", text: "i18n:wn-export-c-page-checked" },
      current: { value: "current", text: "i18n:wn-export-c-page-current" },
      all: { value: "all", text: "i18n:wn-export-c-page-all" }
    }
    let pageOptions = []
    _.forEach(pageModes, md => {
      if (pageMap[md])
        pageOptions.push(pageMap[md])
    })
    //result.page = _.first(pageOptions).value
    //............................................
    // Make the config form fields
    let formFields = [];
    formFields.push({
      title: "i18n:wn-export-c-mode",
      name: "mode",
      comType: "TiSwitcher",
      comConf: {
        allowEmpty: false,
        options: modeOptions
      }
    })
    if (!_.isEmpty(oMapplingItems)) {
      result.mapping = _.first(oMapplingItems).id
      formFields.push({
        title: "i18n:wn-export-c-mapping",
        name: "mapping",
        comType: "TiDroplist",
        comConf: {
          options: oMapplingItems,
          iconBy: "icon",
          valueBy: "id",
          textBy: "title|nm",
          dropDisplay: ['<icon:zmdi-book>', 'title|nm']
        }
      })
    }
    formFields.push({
      title: "i18n:wn-export-c-page",
      name: "page",
      comType: "TiSwitcher",
      comConf: {
        allowEmpty: false,
        options: pageOptions
      }
    })
    formFields.push({
      title: "i18n:wn-export-c-limit",
      name: "limit",
      type: "Integer",
      visible: {
        "page": "all"
      },
      comType: "TiInputNum",
      comConf: {
      }
    })
    formFields.push({
      title: "i18n:wn-export-c-name",
      name: "name",
      comType: "TiInput",
      comConf: {
      }
    })
    formFields.push({
      title: "i18n:wn-export-c-expi",
      name: "expiIn",
      comType: "TiSwitcher",
      comConf: {
        allowEmpty: false,
        options: [
          { value: 3, text: "i18n:wn-export-c-expi-3d" },
          { value: 7, text: "i18n:wn-export-c-expi-7d" },
          { value: 14, text: "i18n:wn-export-c-expi-14d" },
          { value: 0, text: "i18n:wn-export-c-expi-off" }
        ]
      }
    })
    //............................................
    // Open the dialog to collection user selection
    let vm = this
    await Ti.App.Open({
      title: "i18n:export-data",
      width: 640,
      height: 640,
      position: "top",
      textOk: null, textCancel: null,
      result,
      comType: "TiWizard",
      comConf: {
        style: {
          padding: ".5em"
        },
        steps: [{
          title: "i18n:wn-export-setup",
          comType: "TiForm",
          comConf: {
            data: ":=..",
            fields: formFields
          },
          prev: false,
          next: {
            enabled: {
              name: "![BLANK]"
            },
            handler: function () {
              let outPath = `${taDir}/${this.value.name}.${this.value.mode}`
              let cmds = [`o id:${vm.dirId} @query`]
              //............................................
              // Eval Sorter
              if (!_.isEmpty(vm.sorter)) {
                let sort = JSON.stringify(vm.sorter)
                cmds.push(`-sort '${sort}'`)
              }
              //............................................
              // Eval filter
              let fltInput = JSON.stringify(_.assign({}, vm.filter, vm.fixedMatch))
              // Checked ids
              if ("checked" == this.value.page) {
                fltInput = JSON.stringify({
                  id: checkedIds
                })
              }
              // Join pager
              else if ("current" == this.value.page) {
                let limit = vm.searchPageSize || 1000
                let skip = Math.max(vm.searchPageSize * (vm.searchPageNumber - 1), 0)
                cmds.push(`-limit ${limit}`)
                cmds.push(`-skip  ${skip}`)
              }
              // All pager
              else if ("all" == this.value.page) {
                let limit = this.value.limit || 1000
                cmds.push(`-limit ${limit}`)
              }

              // Join the export 
              cmds.push('@json -cqnl')
              cmds.push('|', 'sheet -process "${P} : ${id} : ${title} : ${nm}"')
              cmds.push("-tpo " + this.value.mode)
              // Mapping
              if (this.value.mapping) {
                cmds.push(`-mapping id:${this.value.mapping}`)
              }

              cmds.push(`-out '${outPath}';\n`)

              // expi time
              if (this.value.expiIn > 0) {
                cmds.push(`obj ${outPath} -u 'expi:"%ms:now+${this.value.expiIn}d"';`)
              }

              // Join command
              let cmdText = cmds.join(" ")

              // Confirm change
              this.$notify("change", {
                ...this.value,
                outPath,
                cmdText,
                fltInput
              })

              // Go to run command
              this.gotoFromCurrent(1)
            }
          }
        }, {
          title: "i18n:wn-export-ing",
          comType: "WnCmdPanel",
          comConf: {
            value: ":=cmdText",
            input: ":=fltInput",
            tipText: "i18n:wn-export-ing-tip",
            tipIcon: "fas-bullhorn",
            emitName: "step:change",
            emitPayload: "%next"
          },
          prev: false,
          next: false
        }, {
          title: "i18n:wn-export-done",
          prepare: async function () {
            let oTa = await Wn.Io.loadMeta(this.value.outPath)
            this.$notify("change", {
              ... this.value,
              target: oTa
            })
          },
          comType: "WebMetaBadge",
          comConf: {
            className: "is-success",
            value: ":=target",
            icon: "fas-check-circle",
            title: "i18n:wn-export-done-ok",
            brief: "i18n:wn-export-done-tip",
            links: [{
              icon: "fas-download",
              text: ":=target.nm",
              href: ":->/o/content?str=id:${target.id}&d=true",
              newtab: true
            }, {
              icon: "fas-external-link-alt",
              text: "i18n:wn-export-open-dir",
              href: Wn.Util.getAppLink(taDir),
              newtab: true
            }]
          }
        }]
      },
      components: [
        "@com:ti/wizard",
        "@com:ti/form",
        "@com:wn/cmd/panel",
        "@com:web/meta/badge"
      ]
    })
  },
  //--------------------------------------------
  //
  // Download / Upload
  //
  //--------------------------------------------
  async downloadCheckItems() {
    let list = this.getCheckedItems()
    if (_.isEmpty(list)) {
      return await Ti.Toast.Open('i18n:wn-download-none', "warn")
    }
    // Too many, confirm at first
    if (list.length > 5) {
      if (!await Ti.Confirm({
        text: "i18n:wn-download-too-many",
        vars: { N: list.length }
      })) {
        return
      }
    }
    // Do the download
    for (let it of list) {
      if ('FILE' != it.race) {
        if (!await Ti.Confirm({
          text: "i18n:wn-download-dir",
          vars: it
        }, {
          textYes: "i18n:continue",
          textNo: "i18n:terminate"
        })) {
          return
        }
        continue;
      }
      let link = Wn.Util.getDownloadLink(it)
      Ti.Be.OpenLink(link)
    }
  },
  //--------------------------------------------
  //
  // Open
  //
  //--------------------------------------------
  async openCurrentMetaEditor() {
    // Guard
    if (!this.meta && !this.oDir) {
      return await Ti.Toast.Open("i18n:empty-data", "warn")
    }
    //.........................................
    // For current selected
    //.........................................
    if (this.meta) {
      // Edit current meta
      let reo = await Wn.EditObjMeta(this.meta, {
        fields: "default", autoSave: false
      })

      // Cancel the editing
      if (_.isUndefined(reo)) {
        return
      }

      // Update the current editing
      let { updates } = reo
      if (!_.isEmpty(updates)) {
        await this.dispatch("updateMeta", updates)
      }
      return
    }
    //.........................................
    // For Whole thing thing
    //.........................................
    await Wn.EditObjMeta(this.oDir, {
      fields: "auto", autoSave: true
    })
  },
  //--------------------------------------------
  async openCurrentPrivilege() {
    let meta = this.meta || this.oDir

    if (!meta) {
      await Ti.Toast.Open("i18n:nil-obj")
      return
    }

    let newMeta = await Wn.EditObjPvg(meta)

    // Update to current list
    if (newMeta) {
      // Update Current Meta
      console.log("pvg", newMeta)
      if (this.meta && this.meta.id == newMeta.id) {
        this.dispatch("changeMeta", newMeta)
      }
      // Update Thing Set
      else {
        await this.dispatch("reload", newMeta)
      }
    }

    return newMeta
  },
  //------------------------------------------------
  //
  // Delegate WnObjAdaptor methods
  //
  //------------------------------------------------
  getWnAdaptlist() {
    return this.findComBy($com => {
      return "WnAdaptlist" == $com.tiComType
    })
  },
  //------------------------------------------------
  delegateWnAdaptlist(methodName, ...args) {
    let $AL = this.getWnAdaptlist()
    if ($AL) {
      return $AL[methodName](...args)
    }
  },
  //------------------------------------------------
  async asyncDelegateWnAdaptlist(methodName, ...args) {
    let $AL = this.getWnAdaptlist()
    if ($AL) {
      return await $AL[methodName](...args)
    }
  },
  //------------------------------------------------
  // Delegates
  //------------------------------------------------
  invokeList(methodName) {
    return this.delegateWnAdaptlist("invokeList", methodName)
  },
  openLocalFileSelectdDialog() {
    return this.delegateWnAdaptlist("openLocalFileSelectdDialog")
  },
  async openCurrentPrivilege() {
    return this.asyncDelegateWnAdaptlist("openCurrentPrivilege")
  },
  async doCreate() {
    return this.asyncDelegateWnAdaptlist("doCreate")
  },
  async doRename() {
    return this.asyncDelegateWnAdaptlist("doRename")
  },
  async doBatchUpdate() {
    return this.asyncDelegateWnAdaptlist("doBatchUpdate")
  },
  async doMoveTo() {
    return this.asyncDelegateWnAdaptlist("doMoveTo")
  },
  async doDelete(confirm) {
    return this.asyncDelegateWnAdaptlist("doDelete", confirm)
  }
  //--------------------------------------------
}