const _M = {
  ///////////////////////////////////////////////////////
  data: () => ({
    myData: {},
    myMappingFiles: [],
    myCanFields:[]
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
    "mappingPath": {
      type: [String, Array]
    },
    // If multi mapping paths, the first one(order by name) will 
    // be used defaultly. But you can indicate it in this prop.
    // [optional]
    "defaultMappingName": {
      type: String
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
    "outputName": {
      type: [String, Function]
    },
    // Tmpl as target full path
    // Or async function to load Target Object of path
    // `(context={}):String|Object`
    // the context same with command
    // [required]
    "outputTarget": {
      type: [String, Function]
      // sunc as "~/tmp/${name}"
    },
    // additional render vars for output target
    "vars": {
      type: Object,
      default: () => ({})
    },
    "value": {
      type: Object
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "outputType": {
      type: String,
      default: "xlsx"
    },
    "outputTypeOptions": {
      type: Array,
      default: () => [
        { value: "xlsx", text: "i18n:wn-export-c-type-xls" },
        { value: "json", text: "i18n:wn-export-c-type-json" }
      ]
    },
    "outputMode": {
      type: String,
      default: "checked"
    },
    "outputModeOptions": {
      type: Array,
      default: () => [
        { value: "checked", text: "i18n:wn-export-c-mode-checked" },
        { value: "current", text: "i18n:wn-export-c-mode-current" },
        { value: "scope", text: "i18n:wn-export-c-mode-scope" },
        { value: "all", text: "i18n:wn-export-c-mode-all" }
      ]
    },
    // Auto remove target when expired.
    // null, never expired
    "targetExpi": {
      type: String,
      default: "1d"
    },
    "targetExpiOptions": {
      type: Array,
      default: () => [
        { value: "1d", text: "i18n:wn-export-c-expi-1d" },
        { value: "3d", text: "i18n:wn-export-c-expi-3d" },
        { value: "7d", text: "i18n:wn-export-c-expi-7d" },
        { value: "14d", text: "i18n:wn-export-c-expi-14d" },
        { value: "30d", text: "i18n:wn-export-c-expi-30d" },
        { value: null, text: "i18n:wn-export-c-expi-off" },
      ]
    },
    // AutoMatch expression Object, to filter the default mapping fields
    // if nil, all fields will be selected
    "defaultFields": {
      type: [String, Array, Object]
    },
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
    "command": {
      type: [String, Function]
    },
    // command input, if Array it will auto-stringify to JSON
    "commandInput": {
      type: [String, Array]
    },
    // additional render vars for output target
    "vars": {
      type: Object,
      default: () => ({})
    },

    //-----------------------------------
    // Aspect
    //-----------------------------------
    "title": {
      type: String,
      default: undefined
    },
  },
  ///////////////////////////////////////////////////////
  computed: {
    //---------------------------------------------------
    WizardSteps() {
      return [
        this.Step1Config,
        this.Step2ChooseFields,
        this.Step3Process,
        this.Step4Finished
      ]
    },
    //---------------------------------------------------
    LoadTarget() {
      let target = this.outputTarget
      if (_.isFunction(target)) {
        return target
      }
      return Ti.Tmpl.parse(target)
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods: {
    //---------------------------------------------------
    OnChange(data) {
      this.changeData(data)
    },
    //---------------------------------------------------
    OnOutputFieldsChange(fields=[]){
      this.changeData({fields})
    },
    //---------------------------------------------------
    OnResetTargetName() {
      let name = this.genOutputName()
      this.changeData({ name })
    },
    //---------------------------------------------------
    genOutputName(type = this.outputType) {
      let target = this.outputName
      //console.log(target)
      let d = new Date()
      let payload = Ti.DateTime.genFormatContext(d)
      payload.today = Ti.DateTime.format(d, "yyyy-MM-dd")
      payload.now = Ti.DateTime.format(d, "yyyy-MM-dd_HHmmss")
      payload.type = type
      if (_.isFunction(target)) {
        return target(payload)
      }
      if (_.isString(target)) {
        let taTmpl = Ti.Tmpl.parse(target)
        return taTmpl.render(payload)
      }
      throw `Invalid target: [${target}]`
    },
    //---------------------------------------------------
    async reload() {
      console.log("WDE:reload")
      // reload all option mapping paths
      let paths = _.concat(this.mappingPath)
      let fld = "^(id|race|tp|mime|nm|title)$"
      let list = []
      for (let path of paths) {
        if (!path) {
          continue
        }
        let oF = await Wn.Sys.exec2(`o '${path}' @json '${fld}' -cqn`, { as: "json" })
        if (oF && oF.id) {
          if ("DIR" == oF.race) {
            let files = await Wn.Sys.exec2(`o 'id:${oF.id}' @query 'tp:"json"' @json '${fld}' -cqnl`, { as: "json" })
            if (_.isArray(files)) {
              list.push(...files)
            }
          }
          // Just a file
          else {
            list.push(oF)
          }
        }
      }
      // Found the default
      let mappingId = null
      if (!_.isEmpty(list)) {
        mappingId = _.first(list).id
        if (this.defaultMappingName) {
          for (let li of list) {
            if (li.nm == this.defaultMappingName) {
              mappingId = li.id
              break;
            }
          }
        }
      }
      let data = {
        type: this.outputType,
        mode: this.outputMode,
        mapping: mappingId,
        name: this.genOutputName()
      }
      if (this.targetExpi) {
        data.expi = `${this.targetExpi}`
      }
      if (this.value) {
        _.assign(data, this.value)
      }
      this.changeData(data)

      this.myMappingFiles = list
    },
    //---------------------------------------------------
    changeData(data) {
      this.myData = _.assign({}, this.myData, data)
      this.tryNotifyChange(this.myData)
    },
    //---------------------------------------------------
    tryNotifyChange(data) {
      if (!_.isEqual(this.value, data)) {
        this.$notify("change", data)
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  mounted: async function () {
    //console.log("mouned")
    await this.reload()
  }
  ///////////////////////////////////////////////////////
}
export default _M;