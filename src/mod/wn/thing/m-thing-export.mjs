export default {
  //--------------------------------------------
  async openExportDataDir({state}, target) {
    let meta = state.meta
    let taDir = target || `id:${meta.id}/export_data`
    console.log(taDir)
    let oDir = await Wn.Io.loadMeta(taDir)
    let link = Wn.Util.getAppLink(oDir)

    await Ti.Be.Open(link.url, {params:link.params})
  },
  //--------------------------------------------
  async exportDataByModes({dispatch}, mode="csv;xls;data") {
    await dispatch("exportData", {mode})
  },
  //--------------------------------------------
  //
  // Export to csv or excel
  //
  //--------------------------------------------
  async exportData({state, getters}, {
    target, mode="csv;xls;data"
  }={}) {
    let meta = state.meta
    let cmds = [`thing id:${meta.id} query -cqn`]
    //............................................
    let taDir = target || `id:${meta.id}/export_data`
    //............................................
    // Eval Sorter
    if(!_.isEmpty(state.sorter)) {
      let sort = JSON.stringify(state.sorter)
      cmds.push(`-sort '${sort}'`)
    }
    //............................................
    let fltInput = getters["search/filterStr"]
    //............................................
    // Eval default export name
    let ts = Ti.DateTime.format(new Date(), 'yyyy-MM-dd_HHmmss')
    let exportName = `${Ti.I18n.text(meta.title||meta.nm)}-${ts}`
    //............................................
    // Try load export mapping template
    let oExDir = await Wn.Io.loadMeta(`id:${meta.id}/export/`)
    let oExList = []
    if(oExDir) {
      oExList = (await Wn.Io.loadChildren(oExDir)).list;
    }
    //............................................
    // Prepare the result
    let result = {
      mode : "xls",
      page : "current",
      name : exportName,
      expiIn : 3,
      fltInput,
      cmdText : undefined,
      outPath : undefined,
      target : undefined
    }
    //............................................
    // Eval modes options
    let modeNames = mode.split(";")
    let modeMap = {
      csv  : {value: "csv",  text: "i18n:thing-export-c-mode-csv"},
      xls  : {value: "xls",  text: "i18n:thing-export-c-mode-xls"},
      data : {value: "data", text: "i18n:thing-export-c-mode-data"}
    }
    let modeOptions = []
    _.forEach(modeNames, nm => {
      modeOptions.push(modeMap[nm])
    })
    //............................................
    // Make the config form fields
    let formFields = [];
    formFields.push({
      title : "i18n:thing-export-c-mode",
      name : "mode",
      comType : "TiSwitcher",
      comConf : {
        options: modeOptions
      }
    })
    if(!_.isEmpty(oExList)) {
      result.mapping = _.first(oExList).nm
      formFields.push({
        title : "i18n:thing-export-c-mapping",
        name : "mapping",
        disabled : {
          mode : "full"
        },
        comType : "TiDroplist",
        comConf : {
          options : oExList,
          iconBy  : "icon",
          valueBy : "nm",
          textBy  : "title|nm",
          dropDisplay: ['<icon:zmdi-book>', 'title|nm']
        }
      })
    }
    formFields.push({
      title : "i18n:thing-export-c-page",
      name : "page", 
      comType : "TiSwitcher",
      comConf : {
        options: [
          {value: "current",  text: "i18n:thing-export-c-page-current"},
          {value: "all",      text: "i18n:thing-export-c-page-all"}
        ]
      }
    })
    formFields.push({
      title : "i18n:thing-export-c-name",
      name : "name", 
      comType : "TiInput",
      comConf : {
      }
    })
    formFields.push({
      title : "i18n:thing-export-c-expi",
      name : "expiIn", 
      comType : "TiSwitcher",
      comConf : {
        options: [
          {value: 3,  text: "i18n:thing-export-c-expi-3d"},
          {value: 7,  text: "i18n:thing-export-c-expi-7d"},
          {value: 14, text: "i18n:thing-export-c-expi-14d"},
          {value: 0,  text: "i18n:thing-export-c-expi-off"}
        ]
      }
    })
    //............................................
    // Open the dialog to collection user selection
    await Ti.App.Open({
      title  : "i18n:export-data",
      width  : 640,
      height : 640,
      position : "top",
      textOk: null, textCancel: null,
      result,
      comType : "TiWizard",
      comConf : {
        style : {
          padding: ".5em"
        },
        steps : [{
          title : "i18n:thing-export-setup",
          comType : "TiForm",
          comConf : {
            data : ":=..",
            fields : formFields
          },
          prev : false,
          next : {
            enabled : {
              name : "![BLANK]"
            },
            handler : function() {
              let outPath = `${taDir}/${this.value.name}.${this.value.mode}`
              // Join pager
              if("current" == this.value.page) {
                let limit = state.pager.pgsz
                let skip  = state.pager.pgsz * (state.pager.pn - 1)
                cmds.push(`-limit ${limit}`)
                cmds.push(`-skip  ${skip}`)
              }

              // Join the export 
              cmds.push('|', 'sheet -process "${P} : ${id} : ${title} : ${nm}"')
              cmds.push("-tpo " + this.value.mode)
              cmds.push(`-out '${outPath}';`)

              // expi time
              if(this.value.expiIn > 0) {
                cmds.push(`obj ${outPath} -u 'expi:"%ms:now+${this.value.expiIn}d"';`)
              }

              // Join command
              let cmdText = cmds.join(" ")

              // Confirm change
              this.$notify("change", {
                ...this.value,
                outPath,
                cmdText
              })

              // Go to run command
              this.gotoFromCurrent(1)
            }
          }
        }, {
          title : "i18n:thing-export-ing",
          comType : "WnCmdPanel",
          comConf : {
            value : ":=cmdText",
            input : fltInput,
            tipText : "i18n:thing-export-ing-tip",
            tipIcon : "fas-bullhorn",
            emitName : "step:change",
            emitPayload : "%next"
          },
          prev : false,
          next : false
        }, {
          title : "i18n:thing-export-done",
          prepare : async function(){
            let oTa = await Wn.Io.loadMeta(this.value.outPath)
            console.log(oTa)
            this.$notify("change", {
              ... this.value,
              target : oTa
            })
          },
          comType : "WebMetaBadge",
          comConf : {
            className : "is-success",
            value : ":=target",
            icon  : "fas-check-circle",
            title : "i18n:thing-export-done-ok",
            brief : "i18n:thing-export-done-tip",
            links : {
              icon : "fas-download",
              text : ":=target.nm",
              href : ":->/o/content?str=id:${target.id}&d=true",
              newtab : true
            }
          }
        }]
      },
      components : [
        "@com:ti/wizard",
        "@com:ti/form",
        "@com:wn/cmd/panel",
        "@com:web/meta/badge"
      ]
    })
  }
}