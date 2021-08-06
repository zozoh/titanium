const _M = {
  //////////////////////////////////////////////////////
  data : ()=>({
  }),
  //////////////////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value" : {
      type : Object
    },
    "keyType" : {
      type : String,
      default : "kebab",
      validator : v => /^(kebab|camel|snake)$/.test(v)
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "form" : {
      type : Object,
      default : ()=>({})
    },
    "rules" : {
      type : [Array, String, Object, Boolean, RegExp],
      default : true
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "blankAs" : {
      type : Object,
      default : ()=>({
        className : "as-mid",
        icon : "fas-ruler-combined",
        text : "empty-data"
      })
    }
  },
  //////////////////////////////////////////////////////
  computed : {
    //--------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------------------
    ValueObj() {
      let re = {}
      _.forEach(this.value, (value, k)=>{
        let key = _.kebabCase(k)
        re[key] = value
      })
      return re;
    },
    //--------------------------------------------------
    ValueTable() {
      let re = []
      _.forEach(this.ValueObj, (value, name)=>{
        let title = Wn.Hm.getCssPropTitle(name)
        re.push({
          title, name, value
        })
      })
      return re;
    },
    //--------------------------------------------------
    FormatKey() {
      return ({
        "kebab" : _.kebabCase,
        "camel" : _.camelCase,
        "snake" : _.snakeCase
      })[this.keyType]
    },
    //--------------------------------------------------
    isEmpty() {
      return _.isEmpty(this.ValueTable)
    },
    //--------------------------------------------------
    ActionItems() {
      return [{
        icon : "fas-drafting-compass",
        text : "i18n:edit",
        action : ()=>{
          this.openCssFormDialog()
        }
      }, {
        icon : "fas-code",
        action : ()=>{
          this.openCssCodeDialog()
        }
      }, {
        icon : "far-trash-alt",
        text: "i18n:clear",
        action : ()=>{
          this.clearValue()
        }
      }]
    },
    //--------------------------------------------------
    EmptyButtonSetup() {
      return [{
        icon : "fas-drafting-compass",
        text : "i18n:edit",
        handler : ()=>{
          this.openCssFormDialog()
        }
      }]
    },
    //--------------------------------------------------
    FormConfig() {
      let conf = _.cloneDeep(this.form)
      _.defaults(conf, {
        spacing : "tiny"
      })
      if(_.isEmpty(conf.fields)) {
        conf.fields = Wn.Hm.findCssPropFields(this.rules)
      }
      return conf
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  methods : {
    //--------------------------------------------------
    OnRemoveValue({name}) {
      let val = _.omit(this.ValueObj, name)
      this.$notify("change", val)
    },
    //--------------------------------------------------
    async openCssFormDialog() {
      // Eval result
      let result = this.ValueObj

      // Open dialog
      let reo = await Ti.App.Open({
        title : "i18n:hmk-css-edit",
        width : "8rem",
        height : "95%",
        position : "top",
        result,
        model : {prop:"data", event:"change"},
        comType : "TiForm",
        comConf : this.FormConfig
      })
      
      // User cancle
      if(!reo)
        return

      // Normlized to value
      let val = this.normalizeValue(reo)

      this.$notify("change", val)
    },
    //--------------------------------------------------
    async openCssCodeDialog() {
      // Eval result
      let result = JSON.stringify(this.ValueObj, null, '   ')

      // Open dialog
      let re = await Ti.App.Open({
        title : "i18n:hmk-css-edit",
        width : "6.4rem",
        height : "95%",
        position : "top",
        result,
        comType : "TiTextJson",
        comConf : {
        },
        components: ["@com:ti/text/json"]
      })
      
      // User cancle
      if(!re)
        return

      // Normlized to value
      let css = JSON.parse(re)
      let val = this.normalizeValue(css)

      this.$notify("change", val)
    },
    //--------------------------------------------------
    normalizeValue(css) {
      let re = {}
      _.forEach(css, (v, k)=>{
        if(Ti.Util.isNil(v) || Ti.S.isBlank(v))
          return
        let key = this.FormatKey(k)
        re[key] = v
      })
      if(_.isEmpty(re))
        return null
      return re
    },
    //--------------------------------------------------
    clearValue() {
      this.$notify("change", null)
    }
    //--------------------------------------------------
  }
  //////////////////////////////////////////////////////
}
export default _M;