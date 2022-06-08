const _M = {
  //////////////////////////////////////////////////////
  data: () => ({
  }),
  //////////////////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value": {
      type: Object
    },
    "keyType": {
      type: String,
      default: "kebab",
      validator: v => /^(kebab|camel|snake)$/.test(v)
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "form": {
      type: Object,
      default: () => ({})
    },
    "rules": {
      type: [Array, String, Object, Boolean, RegExp],
      default: true
    },
    "getCssPropTitle": {
      type: Function,
      default: undefined
    },
    "findRuleFields": {
      type: Function,
      default: undefined
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "autoI18nRuleTitle": {
      type: Boolean,
      default: true
    },
    "dialog": {
      type: Object,
      default: () => ({})
    },
    "blankAs": {
      type: Object,
      default: () => ({
        className: "as-mid",
        icon: "fas-ruler-combined",
        text: "empty-data"
      })
    }
  },
  //////////////////////////////////////////////////////
  computed: {
    //--------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------------------
    ValueObj() {
      let re = {}
      _.forEach(this.value, (value, k) => {
        let key = this.FormatKey(k)
        re[key] = value
      })
      return re;
    },
    //--------------------------------------------------
    ValueTable() {
      let getTitle = this.getCssPropTitle
        || _.get(window, "Wn.Hm.getCssPropTitle")
        || function (v) { return v }
      let re = []
      _.forEach(this.ValueObj, (value, name) => {
        let title = getTitle(name)
        if (/^i18n:(.+)/.test(title)) {
          title = Ti.I18n.text(title)
        }
        else if (this.autoI18nRuleTitle) {
          title = Ti.I18n.get(title)
        }
        re.push({
          title, name, value
        })
      })
      return re;
    },
    //--------------------------------------------------
    FormatKey() {
      return ({
        "kebab": _.kebabCase,
        "camel": _.camelCase,
        "snake": _.snakeCase
      })[this.keyType]
    },
    //--------------------------------------------------
    isEmpty() {
      return _.isEmpty(this.ValueTable)
    },
    //--------------------------------------------------
    ActionItems() {
      return [{
        icon: "fas-drafting-compass",
        text: "i18n:edit",
        action: () => {
          this.openCssFormDialog()
        }
      }, {
        icon: "fas-code",
        action: () => {
          this.openCssCodeDialog()
        }
      }, {
        icon: "far-trash-alt",
        text: "i18n:clear",
        action: () => {
          this.clearValue()
        }
      }]
    },
    //--------------------------------------------------
    EmptyButtonSetup() {
      return [{
        icon: "fas-drafting-compass",
        text: "i18n:edit",
        handler: () => {
          this.openCssFormDialog()
        }
      }]
    },
    //--------------------------------------------------
    FormConfig() {
      let conf = _.cloneDeep(this.form)
      _.defaults(conf, {
        spacing: "tiny"
      })
      let findRuleFields = this.findRuleFields
        || _.get(window, "Wn.Hm.findCssPropFields")
        || function () { return [] }
      if (_.isEmpty(conf.fields)) {
        conf.fields = findRuleFields(this.rules)
      }
      return conf
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  methods: {
    //--------------------------------------------------
    OnRemoveValue({ name }) {
      let val = _.omit(this.ValueObj, name)
      this.$notify("change", val)
    },
    //--------------------------------------------------
    async openCssFormDialog() {
      // Eval result
      let result = this.ValueObj

      // Open dialog
      let reo = await Ti.App.Open(_.assign({
        title: "i18n:hmk-css-edit",
        width: "8rem",
        height: "95%",
        position: "top",
      }, this.dialog, {
        result,
        model: { prop: "data", event: "change" },
        comType: "TiForm",
        comConf: this.FormConfig
      }))

      // User cancle
      if (!reo)
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
      let re = await Ti.App.Open(_.assign({
        title: "i18n:hmk-css-edit",
        width: "6.4rem",
        height: "95%",
        position: "top",
      }, this.dialog, {
        result,
        comType: "TiTextJson",
        comConf: {
        },
        components: ["@com:ti/text/json"]
      }))

      // User cancle
      if (!re)
        return

      // Normlized to value
      let css = JSON.parse(re)
      let val = this.normalizeValue(css)

      this.$notify("change", val)
    },
    //--------------------------------------------------
    normalizeValue(css) {
      let re = {}
      _.forEach(css, (v, k) => {
        if (Ti.Util.isNil(v) || Ti.S.isBlank(v))
          return
        let key = this.FormatKey(k)
        re[key] = v
      })
      if (_.isEmpty(re))
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