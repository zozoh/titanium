export default {
  //--------------------------------------------
  //
  // Export to csv or excel
  //
  //--------------------------------------------
  async exportData({state, getters}) {
    let meta = state.meta
    let cmds = [`thing id:${meta.id} query -cqn`]
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
    // Open the dialog to collection user selection
    await Ti.App.Open({
      title  : "i18n:export-data",
      width  : 640,
      height : 640,
      position : "top",
      textOk: null, textCancel: null,
      result : {
        mode : "csv",
        page : "current",
        name : exportName,
        fltInput,
        cmdText : null
      },
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
            fields : [{
              title : "导出模式",
              name : "mode",
              comType : "TiSwitcher",
              comConf : {
                options: [
                  {value: "xls", text: "电子表格"},
                  {value: "full", text: "完整数据包"}
                ]
              }
            }, {
              title : "数据范围",
              name : "page", 
              comType : "TiSwitcher",
              comConf : {
                options: [
                  {value: "current",  text: "当前页"},
                  {value: "all",      text: "全部页"}
                ]
              }
            }, {
              title : "导出文件名称",
              name : "name", 
              comType : "TiInput",
              comConf : {
              }
            }]
          },
          prev : false,
          next : {
            enabled : {
              name : "![BLANK]"
            },
            handler : function() {
              let cmdText = cmds.join(" ")
              this.$notify("change", {
                ...this.value,
                cmdText
              })
              this.gotoFromCurrent(-1)
            }
          }
        }, {
          title : "i18n:thing-export-ing",
          dataKey : "cmdText",
          comType : "TiLabel",
          comConf : {
            value : ":=.."
          }
        }]
      },
      components : [
        "@com:ti/wizard",
        "@com:ti/form"
      ]
    })
  }
}