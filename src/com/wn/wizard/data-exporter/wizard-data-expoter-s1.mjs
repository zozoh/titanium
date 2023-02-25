export default {
  //---------------------------------------------------
  ConfigFormFields() {
    let fields = []
    // Choose mapping file
    if (this.myMappingFiles.length > 1) {
      fields.push({
        title: "i18n:wn-export-c-mapping",
        name: "mapping",
        tip: {
          text: "i18n:wn-export-c-mapping-tip",
          size: "normal"
        },
        comType: "TiDroplist",
        comConf: {
          placeholder: "i18n:wn-export-c-mapping-phd",
          options: this.myMappingFiles,
          iconBy: "icon",
          valueBy: "id",
          textBy: "title|nm",
          dropDisplay: ['<icon:fas-exchange-alt>', 'title|nm']
        }
      })
    }
    // choose output type
    if (this.outputTypeOptions.length > 1) {
      fields.push({
        title: "i18n:wn-export-c-type",
        name: "type",
        comType: "TiSwitcher",
        comConf: {
          allowEmpty: false,
          options: this.outputTypeOptions
        }
      })
    }

    // Output target mode
    fields.push(
      {
        title: "i18n:wn-export-c-mode",
        name: "mode",
        comType: "TiSwitcher",
        comConf: {
          allowEmpty: false,
          options: this.outputModeOptions
        }
      },
      {
        title: "i18n:wn-export-c-mode-scope",
        name: "scope",
        tip: "i18n:wn-export-c-mode-scope-tip",
        visible: {
          mode: "scope"
        },
        comType: "TiInput",
        comConf: {
          placeholder: "i18n:wn-export-c-mode-scope-phd",
          width: "2rem"
        }
      })

    // Output target name
    fields.push({
      title: "i18n:wn-export-c-name",
      name: "name",
      tip: "i18n:wn-export-c-name-tip",
      comType: "TiInput",
      comConf: {
        placeholder: "i18n:wn-export-c-name-phd",
        hover: ["prefixIcon", "suffixText"],
        prefixIcon: "zmdi-minus",
        suffixText: "i18n:reset",
        suffixTextNotifyName: "target_name:reset"
      }
    })

    if (!_.isEmpty(this.targetExpiOptions)) {
      fields.push({
        title: "i18n:wn-export-c-expi",
        name: "expi",
        tip: "i18n:wn-export-c-expi-tip",
        comType: "TiSwitcher",
        comConf: {
          allowEmpty: false,
          options: this.targetExpiOptions
        }
      })
    }

    // done
    return fields
  },
  //---------------------------------------------------
  Step1Config() {
    return {
      title: "i18n:wn-export-setup",
      comType: "TiForm",
      comConf: {
        autoFieldNameTip: true,
        tipAsPopIcon: true,
        gridColumnHint: 1,
        fields: this.ConfigFormFields,
        data: "=.."
      },
      prev: false,
      next: {
        enabled: function ({ type, mode, scope, name } = {}) {
          return type
            && mode
            && (mode != "scope" || /^[0-9]+[-][0-9+]$/.test(scope))
            && name
        }
      }
    }
  },
  //---------------------------------------------------
}