const _M = {
  ///////////////////////////////////////////////////////
  data: () => ({
    myData: {},
    myMappingFiles: [],
    myCanFields: {
      /*mappingName : []*/
    },
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
      type: [String, Array],
    },
    // If multi mapping paths, the first one(order by name) will
    // be used defaultly. But you can indicate it in this prop.
    // [optional]
    defaultMappingName: {
      type: String,
    },
    // A Tmpl to get the output target path
    // the base render context :
    // {
    //   type: "xlsx",        // <- this.oututMode
    //   yy:"2023",MM:"02",dd:"19",HH:"12",mm:"00",ss:"00"
    //   today:"2023-02-19", now:"2023-02-19_120000"
    // }
    // If function, it will be invoke as `(context={}):String`
    // [required]
    outputName: {
      type: [String, Function],
    },
    // TODO: Maybe allow user to choose the output folder in futrue
    outputTarget: {
      type: [String, Function],
      // sunc as "~/tmp/${name}"
    },
    // additional render vars for output target
    vars: {
      type: Object,
      default: () => ({}),
    },
    data: {
      type: Object,
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    outputType: {
      type: String,
      default: "xlsx",
    },
    outputTypeOptions: {
      type: Array,
      default: () => ["xlsx", "json"],
    },
    outputMode: {
      type: String,
      default: "checked",
    },
    outputModeOptions: {
      type: Array,
      default: () => ["checked", "current", "scope"],
    },
    // Auto remove target when expired.
    // null, never expired
    targetExpi: {
      type: String,
      default: "1h",
    },
    targetExpiOptions: {
      type: Array,
      default: () => ["1h", "6h", "1d", "never"],
    },
    // AutoMatch expression Object, to filter the default mapping fields
    // if nil, all fields will be selected
    // defaultFields: {
    //   type: [String, Array, Object],
    // },
    // A Tmpl as export command, which context:
    /*{
      ... this.vars,          // <- this.vars
      type: "xlsx",           // <- this.oututMode
      mappingId:"89ju...",    // <- this.mappingPath
      name :"xxx.xlsx",     // <- this.outputName
      fields: ['a','b'],      // output field white list
      fieldMatch : "^(a|b)$", // output field AutoMatch String
      expi: "%ms:now+1d",     // <- this.targetExpi
    }*/
    // If function, it will be invoke as `(context={}):String`
    command: {
      type: [String, Function],
    },
    // command input, if Array it will auto-stringify to JSON
    commandInput: {
      type: [String, Array],
    },
    // additional render vars for output target
    vars: {
      type: Object,
      default: () => ({}),
    },

    //-----------------------------------
    // Aspect
    //-----------------------------------
    title: {
      type: String,
      default: undefined,
    },
    gridColumnHint: {
      type: [String, Array],
      default: "[[5,1500],[4,1200],[3,900],[2,600],[1,300],0]",
    },
    fieldsGridColumnHint: {
      type: [String, Array],
      default: "[[6,1500],[5,1250],[4,1000],[3,750],[2,500],1]",
    },
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
    OutputModeOptions() {
      return this.explainOptions(
        this.outputModeOptions,
        this.explainOutputModeOption
      );
    },
    //---------------------------------------------------
    OutputTypeOptions() {
      return this.explainOptions(
        this.outputTypeOptions,
        this.explainOutputTypeOption
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
      let fields = [];

      //
      // Choose mapping file
      //
      if (this.myMappingFiles.length > 1) {
        fields.push({
          title: "i18n:wn-export-c-mapping",
          name: "mapping",
          tip: {
            text: "i18n:wn-export-c-mapping-tip",
            size: "normal",
          },
          comType: "TiDroplist",
          comConf: {
            placeholder: "i18n:wn-export-c-mapping-phd",
            options: this.myMappingFiles,
            iconBy: "icon",
            valueBy: "id",
            textBy: "title|nm",
            dropDisplay: ["<icon:fas-exchange-alt>", "title|nm"],
          },
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
          comType: "TiBulletCheckbox",
          comConf: {
            title: "i18n:wn-export-choose-fields",
            options: this.MappingFields,
            gridColumnHint: this.fieldsGridColumnHint,
            autoI18n: true,
          },
        },
        {
          icon: "zmdi-settings",
          title: "i18n:wn-export-setup",
        }
      );

      //
      // More Setting
      //

      // choose output type
      if (this.OutputTypeOptions.length > 1) {
        fields.push({
          title: "i18n:wn-export-c-type",
          name: "type",
          comType: "TiSwitcher",
          comConf: {
            allowEmpty: false,
            options: this.OutputTypeOptions,
          },
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
            options: this.OutputModeOptions,
          },
        });
      }
      fields.push({
        title: "i18n:wn-export-c-mode-scope",
        name: "scope",
        tip: "[small]i18n:wn-export-c-mode-scope-tip",
        visible: {
          mode: "scope",
        },
        comType: "TiInput",
        comConf: {
          placeholder: "i18n:wn-export-c-mode-scope-phd",
          width: "2rem",
        },
      });

      if (this.TargetExpiOptions.length > 1) {
        fields.push({
          title: "i18n:wn-export-c-expi",
          name: "expi",
          tip: "i18n:wn-export-c-expi-tip",
          comType:
            this.TargetExpiOptions.length > 3 ? "TiDroplist" : "TiSwitcher",
          comConf: {
            allowEmpty: false,
            options: this.TargetExpiOptions,
          },
        });

        // Output target name
        fields.push({
          title: "i18n:wn-export-c-name",
          name: "name",
          tip: "i18n:wn-export-c-name-tip",
          colSpan: 2,
          comType: "TiInput",
          comConf: {
            placeholder: "i18n:wn-export-c-name-phd",
            hover: ["prefixIcon", "suffixText"],
            prefixIcon: "zmdi-minus",
            suffixText: "i18n:reset",
            suffixTextNotifyName: "target_name:reset",
          },
        });
      }
      return fields;
    },
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
    genOutputName(target=this.outputName) {
      //console.log(target)
      let d = new Date();
      let payload = Ti.DateTime.genFormatContext(d);
      payload.today = Ti.DateTime.format(d, "yyyy-MM-dd");
      payload.now = Ti.DateTime.format(d, "yyyy-MM-dd_HHmmss");
      if (_.isFunction(target)) {
        return target(payload);
      }
      if (_.isString(target)) {
        let taTmpl = Ti.Tmpl.parse(target);
        return taTmpl.render(payload);
      }
      throw `Invalid target: [${target}]`;
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
    explainOutputTypeOption(it) {
      if (_.isString(it)) {
        return {
          "xlsx": { value: "xlsx", text: "i18n:wn-export-c-type-xls" },
          "json": { value: "json", text: "i18n:wn-export-c-type-json" },
        }[it];
      }
      return it;
    },
    //---------------------------------------------------
    explainOutputModeOption(it) {
      if (_.isString(it)) {
        return {
          "checked": {
            value: "checked",
            text: "i18n:wn-export-c-mode-checked",
          },
          "current": {
            value: "current",
            text: "i18n:wn-export-c-mode-current",
          },
          "scope": { value: "scope", text: "i18n:wn-export-c-mode-scope" },
          "all": { value: "all", text: "i18n:wn-export-c-mode-all" },
        }[it];
      }
      return it;
    },
    //---------------------------------------------------
    explainExpiOption(it) {
      if (_.isString(it)) {
        return (
          {
            "1h": { value: "1h", text: "i18n:wn-export-c-expi-1h" },
            "2h": { value: "2h", text: "i18n:wn-export-c-expi-2h" },
            "6h": { value: "6h", text: "i18n:wn-export-c-expi-6h" },
            "12h": { value: "12h", text: "i18n:wn-export-c-expi-12h" },

            "1d": { value: "1d", text: "i18n:wn-export-c-expi-1d" },
            "3d": { value: "3d", text: "i18n:wn-export-c-expi-3d" },
            "7d": { value: "7d", text: "i18n:wn-export-c-expi-7d" },
            "14d": { value: "14d", text: "i18n:wn-export-c-expi-14d" },
            "30d": { value: "30d", text: "i18n:wn-export-c-expi-30d" },

            "never": { value: null, text: "i18n:wn-export-c-expi-off" },
          }[it] || { text: it, value: it }
        );
      }
      return it;
    },
    //---------------------------------------------------
    async reloadMappingFields(mappingId = this.MappingFileId) {
      if (mappingId && !this.myCanFields[mappingId]) {
        // Try Cache
        let json = await Wn.Sys.exec2(`cat id:${mappingId}`);
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
                text: li,
                value: key,
              });
            }
            // Complex: "race": {...}
            else if (li.name) {
              cans.push({
                text: li.name,
                value: key,
                asDefault: li.asDefault,
              });
            }
          });
        }
        this.myCanFields = _.assign({}, this.myCanFields, {
          [this.MappingFileId]: cans,
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
          as: "json",
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
        mapping: mappingId,
        name: this.genOutputName(_.get(this.data, "outputName") || this.outputName),
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
    },
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  mounted: async function () {
    //console.log("mouned")
    await this.reload();
  },
  ///////////////////////////////////////////////////////
};
export default _M;
