const _M = {
  ///////////////////////////////////////////////////////
  data: () => ({
    myData: {},
    myMappingFiles: [],
    myCanFields: {
      /*mappingName : []*/
    }
  }),
  ///////////////////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    // candicate mapping files
    // If DIR, then get all json in it is option mapping files.
    // It will show drop list when multi mapping files.
    // Anyway, it need a mapping file, to get all avaliable fields.
    // [required]
    mappingPath: {
      type: [String, Array]
    },
    // If multi mapping paths, the first one(order by name) will
    // be used defaultly. But you can indicate it in this prop.
    // [optional]
    defaultMappingName: {
      type: String
    },
    // TODO: Maybe allow user to choose the output folder in futrue
    uploadTarget: {
      type: [String, Function]
      // sunc as "~/tmp/${name}"
    },
    // additional render vars for output target
    vars: {
      type: Object,
      default: () => ({})
    },
    data: {
      type: Object
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    outputMode: {
      type: String,
      default: "all"
    },
    outputModeOptions: {
      type: Array,
      default: () => ["all", "scope"]
    },
    // Auto remove target when expired.
    // null, never expired
    targetExpi: {
      type: String,
      default: "6h"
    },
    targetExpiOptions: {
      type: Array,
      default: () => ["1h", "6h", "1d"]
    },
    uploadTip: {
      type: [String, Object],
      default: "i18n:wn-import-upload-xlsx-tip"
    },
    uploadValueType: {
      type: String,
      default: "id"
    },
    uploadSupportTypes: {
      type: Array,
      default: () => ["xlsx"]
    },
    moreFields: {
      type: Array
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    title: {
      type: String,
      default: undefined
    },
    gridColumnHint: {
      type: [String, Array],
      default: "[[5,1500],[4,1200],[3,900],[2,600],[1,300],0]"
    },
    fieldsGridColumnHint: {
      type: [String, Array],
      default: "[[6,1500],[5,1250],[4,1000],[3,750],[2,500],1]"
    }
  },
  ///////////////////////////////////////////////////////
  computed: {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass({});
    },
    //---------------------------------------------------
    MappingFileId() {
      return _.get(this.myData, "mapping");
    },
    //---------------------------------------------------
    MappingFields() {
      return _.get(this.myCanFields, this.MappingFileId) || [];
    },
    //---------------------------------------------------
    FormUploadTarget() {
      return Ti.Tmpl.exec(this.uploadTarget, this.vars);
    },
    //---------------------------------------------------
    OutputModeOptions() {
      return this.explainOptions(
        this.outputModeOptions,
        this.explainOutputModeOption
      );
    },
    //---------------------------------------------------
    TargetExpiOptions() {
      return this.explainOptions(
        this.targetExpiOptions,
        this.explainExpiOption
      );
    },
    //---------------------------------------------------
    FormFields() {
      let fields = [
        {
          title: "i18n:wn-import-upload",
          name: "fileId",
          fieldWidth: "100%",
          tip: this.uploadTip,
          colSpan: 2,
          comType: "WnUploadFileBox",
          comConf: {
            valueType: this.uploadValueType,
            target: this.FormUploadTarget,
            supportTypes: this.uploadSupportTypes
          }
        }
      ];

      //
      // Choose mapping file
      //
      if (this.myMappingFiles.length > 1) {
        fields.push({
          title: "i18n:wn-import-c-mapping",
          name: "mapping",
          tip: {
            text: "i18n:wn-import-c-mapping-tip",
            size: "normal"
          },
          comType: "TiDroplist",
          comConf: {
            placeholder: "i18n:wn-import-c-mapping-phd",
            options: this.myMappingFiles,
            iconBy: "icon",
            valueBy: "id",
            textBy: "title|nm",
            dropDisplay: ["<icon:fas-exchange-alt>", "title|nm"]
          }
        });
      }

      //
      // Choose Fiels
      //
      fields.push(
        {
          name: "fields",
          type: "Array",
          colSpan: 10,
          visible: {
            mapping: "![BLANK]"
          },
          enabled: {
            fileId: "![BLANK]"
          },
          comType: "TiBulletCheckbox",
          comConf: {
            title: "i18n:wn-export-choose-fields",
            options: this.MappingFields,
            gridColumnHint: this.fieldsGridColumnHint,
            autoI18n: true
          }
        },
        {
          icon: "zmdi-settings",
          title: "i18n:wn-import-setup"
        }
      );

      //
      // More Setting
      //

      if (this.TargetExpiOptions.length > 1) {
        fields.push({
          title: "i18n:wn-import-c-expi",
          name: "expi",
          tip: "i18n:wn-import-c-expi-tip",
          comType:
            this.TargetExpiOptions.length > 3 ? "TiDroplist" : "TiSwitcher",
          comConf: {
            allowEmpty: false,
            options: this.TargetExpiOptions
          }
        });
      }

      // Output target mode
      if (this.OutputModeOptions.length > 1) {
        fields.push({
          title: "i18n:wn-export-c-mode",
          name: "mode",
          comType: "TiSwitcher",
          comConf: {
            allowEmpty: false,
            options: this.OutputModeOptions
          }
        });
      }
      fields.push(
        {
          title: "i18n:wn-data-scope",
          name: "scope",
          tip: "[small]i18n:wn-data-scope-tip",
          visible: {
            mode: "scope"
          },
          comType: "TiInput",
          comConf: {
            placeholder: "i18n:wn-data-scope-phd",
            width: "2rem"
          }
        },
        {
          title: "i18n:wn-import-c-tags",
          name: "lbls",
          tip: "i18n:wn-import-c-tags-tip",
          type: "Array",
          comType: "TiInputTags"
        }
      );

      // Unique key
      fields.push({
        title: "i18n:wn-import-c-uniqkey",
        name: "uniqKey",
        tip: "i18n:wn-import-c-uniqkey-tip",
        comType:"TiInput",
        comConf: {
          placeholder:"i18n:wn-import-c-uniqkey-nil"
        }
      });

      // With Hook
      fields.push({
        title: "i18n:wn-import-c-withhook",
        name: "withHook",
        type:"Boolean",
        tip: "i18n:wn-import-c-withhook-tip",
        comType:"TiToggle"
      });

      // Only Field
      fields.push({
        title: "i18n:wn-import-c-fieldsonly",
        name: "fieldsOnly",
        type:"Boolean",
        tip: "i18n:wn-import-c-fieldsonly-tip",
        comType:"TiToggle"
      });

      // Add more customized fields
      if (!_.isEmpty(this.moreFields)) {
        fields.push(...this.moreFields);
      }

      return fields;
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods: {
    //---------------------------------------------------
    OnChange(data) {
      this.changeData(data);
    },
    //---------------------------------------------------
    OnOutputFieldsChange(fields = []) {
      this.changeData({ fields });
    },
    //---------------------------------------------------
    OnResetTargetName() {
      let name = this.genOutputName();
      this.changeData({ name });
    },
    //---------------------------------------------------
    explainOptions(options = [], fn = _.identity) {
      let re = [];
      if (!_.isEmpty(options)) {
        for (let it of options) {
          let li = fn(it);
          if (!Ti.Util.isNil(li)) {
            re.push(li);
          }
        }
      }
      return re;
    },
    //---------------------------------------------------
    explainOutputModeOption(it) {
      if (_.isString(it)) {
        return {
          "scope": { value: "scope", text: "i18n:wn-data-scope" },
          "all": { value: "all", text: "i18n:wn-import-c-mode-all" }
        }[it];
      }
      return it;
    },
    //---------------------------------------------------
    explainExpiOption(it) {
      if (_.isString(it)) {
        return (
          {
            "1h": { value: "1h", text: "i18n:wn-expi-1h" },
            "2h": { value: "2h", text: "i18n:wn-expi-2h" },
            "6h": { value: "6h", text: "i18n:wn-expi-6h" },
            "12h": { value: "12h", text: "i18n:wn-expi-12h" },

            "1d": { value: "1d", text: "i18n:wn-expi-1d" },
            "3d": { value: "3d", text: "i18n:wn-expi-3d" },
            "7d": { value: "7d", text: "i18n:wn-expi-7d" },
            "14d": { value: "14d", text: "i18n:wn-expi-14d" },
            "30d": { value: "30d", text: "i18n:wn-expi-30d" },

            "never": { value: null, text: "i18n:wn-expi-never" }
          }[it] || { text: it, value: it }
        );
      }
      return it;
    },
    //---------------------------------------------------
    async reloadMappingFields(mappingId = this.MappingFileId) {
      if (mappingId && !this.myCanFields[mappingId]) {
        // Try Cache
        let json = await Wn.Sys.exec2(
          `cat id:${mappingId} | jsonx -cqn @get mapping `
        );
        let cans = [];
        if (!Ti.S.isBlank(json)) {
          let list = JSON.parse(json);
          _.forEach(list, (li, key) => {
            // Group:  "Genaral": "-------------",
            if (/^[-]{5,}$/.test(li)) {
              cans.push({ title: key });
            }
            // Simple: "nm": "Name",
            else if (_.isString(li)) {
              cans.push({
                text: key,
                value: li
              });
            }
            // Complex: "race": {...}
            else if (li.name) {
              cans.push({
                text: key,
                value: li.name,
                asDefault: li.asDefault
              });
            }
          });
        }
        this.myCanFields = _.assign({}, this.myCanFields, {
          [this.MappingFileId]: cans
        });
      }
    },
    //---------------------------------------------------
    async reload() {
      //console.log("WDE:reload");
      // reload all option mapping paths
      let paths = _.concat(this.mappingPath);
      let fld = "^(id|race|tp|mime|nm|name|title)$";
      let list = [];
      for (let path of paths) {
        if (!path) {
          continue;
        }
        let oF = await Wn.Sys.exec2(`o '${path}' @name @json '${fld}' -cqn`, {
          as: "json"
        });
        if (oF && oF.id) {
          if ("DIR" == oF.race) {
            let files = await Wn.Sys.exec2(
              `o 'id:${oF.id}' @query 'tp:"json"' @name @json '${fld}' -cqnl`,
              { as: "json" }
            );
            if (_.isArray(files)) {
              list.push(...files);
            }
          }
          // Just a file
          else {
            list.push(oF);
          }
        }
      }
      // Found the default
      let mappingId = _.get(this.data, "mapping");
      if (!_.isEmpty(list) && !mappingId && _.isEmpty(this.MappingFields)) {
        mappingId = _.first(list).id;
        if (this.defaultMappingName) {
          for (let li of list) {
            if (li.name == this.defaultMappingName) {
              mappingId = li.id;
              break;
            }
          }
        }
      }
      // Try reload mapping fields
      this.reloadMappingFields(mappingId);

      // Notify change
      let data = {
        type: this.outputType,
        mode: this.outputMode,
        mapping: mappingId
      };
      if (this.targetExpi) {
        data.expi = `${this.targetExpi}`;
      }
      if (this.data) {
        _.assign(data, this.data);
      }
      this.changeData(data);

      this.myMappingFiles = list;
    },
    //---------------------------------------------------
    changeData(data) {
      this.myData = _.assign({}, this.myData, data);
      this.tryNotifyChange(this.myData);
    },
    //---------------------------------------------------
    tryNotifyChange(data) {
      if (!_.isEqual(this.data, data)) {
        this.$notify("change", data);
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  mounted: async function () {
    //console.log("mouned")
    await this.reload();
  }
  ///////////////////////////////////////////////////////
};
export default _M;
