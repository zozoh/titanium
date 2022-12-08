const _M = {
  ////////////////////////////////////////////////////
  data: () => ({
    isPicking: false,
    myValueIcon: undefined,
    myValueText: undefined
  }),
  ////////////////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value": undefined,
    "options": {
      type: [String, Array, Function, Ti.Dict],
      default: () => []
    },
    // If dynamic dictionary: options = '#DickName(=varName)'
    // it will use Ti.DictFactory.CheckDynamicDict,
    // The key of the instance name, should explain for the vars set
    "dictVars": {
      type: Object,
      default: () => ({})
    },
    "valueBy": {
      type: [String, Function],
      default: () => (it) => {
        return Ti.Util.getFallback(it, "value", "nm", "id")
      }
    },
    "textBy": {
      type: [String, Function],
      default: "nickname|title|text|name"
    },
    "iconBy": {
      type: [String, Function],
      default: undefined
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "readonly": {
      type: Boolean,
      default: false
    },
    "multi": {
      type: Boolean,
      default: false
    },
    "focused": {
      type: Boolean,
      default: false
    },
    "input": {
      type: Object
    },
    "filterlist": {
      type: Object
    },
    "mustInList": {
      type: Boolean,
      default: false
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "dialog": {
      type: Object
    },
    "placeholder": {
      type: [String, Number],
      default: undefined
    },
    "pickingIcon": {
      type: String,
      default: "fas-cog fa-spin"
    },
    "pickingText": {
      type: String,
      default: "..."
    },
    "prefixIcon": {
      type: String,
      default: "zmdi-minus"
    },
    "suffixIcon": {
      type: String,
      default: "fas-cog"
    },
    // only for single box-mode
    "boxMode": {
      type: String,
      default: "auto",
      validator: v => /^(auto|value-text|text-value|text|value)$/.test(v)
    },
    "canInput": {
      type: Boolean,
      default: true
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "width": {
      type: [Number, String],
      default: undefined
    },
    "height": {
      type: [Number, String],
      default: undefined
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    },
    //------------------------------------------------
    InputBoxMode() {
      if ("auto" == this.boxMode) {
        return this.canInput ? "value-text" : "text-value"
      }
      return this.boxMode || "value-text"
    },
    //------------------------------------------------
    ComType() {
      return this.multi ? "TiInputTags" : "TiInput"
    },
    //------------------------------------------------
    ComConf() {
      let conf = _.assign({
        readonly: this.readonly || this.isPicking || !this.canInput,
        focused: this.focused,
        placeholder: this.placeholder
      }, this.input)

      if (!this.readonly) {
        conf.suffixIcon = this.suffixIcon
      }

      // Multi 
      if (this.multi) {
        conf.dict = this.Dict
        conf.value = this.value
      }
      // Single
      else {
        conf.prefixIcon = this.myValueIcon || this.prefixIcon
        conf.prefixIconNotifyName = null

        if (!conf.readonly) {
          conf.focusValue = this.value
        }

        if ("value-text" == this.InputBoxMode) {
          conf.value = this.value
          conf.suffixText = this.myValueText
        }
        else if ("text-value" == this.InputBoxMode) {
          conf.value = this.myValueText
          conf.suffixText = this.value
        }
        else if ("text" == this.InputBoxMode) {
          conf.value = this.myValueText
        }
        else if ("value" == this.InputBoxMode) {
          conf.value = this.value
        }
      }

      if (this.isPicking) {
        conf.suffixIcon = this.pickingIcon
        if (!this.multi && this.pickingText) {
          conf.suffixText = this.pickingText
        }
      }

      return conf
    },
    //------------------------------------------------
    Dict() {
      if (!this.myDict) {
        this.myDict = this.createDict()
      }
      return this.myDict
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    async OnInputChange(value) {
      console.log("OnInputChange")
      // Guard: only check with dict
      if (!this.Dict) {
        this.tryNotifyChange(value)
        return
      }
      // null
      if (Ti.Util.isNil(value)) {
        this.tryNotifyChange(value)
        return
      }
      // Multi check
      if (_.isArray(value)) {
        let vals = []
        for (let val of value) {
          if (this.mustInList) {
            if (await this.Dict.hasItem(val)) {
              vals.push(val)
            }
          } else {
            vals.push(val)
          }
        }
        this.tryNotifyChange(vals)
      }
      // Single check
      else if (this.mustInList) {
        if (await this.Dict.hasItem(value)) {
          this.tryNotifyChange(value)
        } else {
          this.tryNotifyChange(null)
        }
      } else {
        this.tryNotifyChange(value)
      }
    },
    //------------------------------------------------
    async OnClickSuffixIcon() {
      // Guard: Picking
      if (this.isPicking) {
        return
      }
      // Mark: Picking
      this.isPicking = true

      // 获取数据
      let dataList = await this.Dict.getData()

      // Prepare list conf
      let listConf = {
        multi: this.multi,
        checkable: this.multi,
        idBy: this.valueBy,
        dftLabelHoverCopy: false,
        data: dataList,
        display: [
          "<icon>",
          this.textBy || "nickname|title|text|name",
          `${this.valueBy || "value|nm|id"}::align-right as-tip-block`
        ]
      }
      if (this.multi) {
        listConf.checkedIds = this.value
      } else {
        listConf.currentId = this.value
      }

      // Prepare the filter list config
      let fltListConf = _.merge({
        className: "ti-fill-parent",
        list: listConf
      }, this.filterlist)

      // Open the dialog
      let reo = await Ti.App.Open(_.assign({
        title: "i18n:select",
        position: "top",
        width: "4.8rem",
        height: "62%",
      }, this.dialog, {
        model: { event: "select" },
        events: {
          open: function () {
            this.close(this.result)
          }
        },
        comType: "TiFilterlist",
        comConf: fltListConf,
        components: [
          "@com:ti/filterlist"
        ],
        beforeClosed: () => {
          this.isPicking = false
        }
      }))

      // User Cancel
      if (!reo) {
        return
      }

      // Multi
      if (this.multi) {
        let vals = Ti.Util.truthyKeys(reo.checkedIds)
        this.tryNotifyChange(vals)
      }
      // Change the currency
      else {
        let val = reo.currentId || null
        this.tryNotifyChange(val)
      }
    },
    //------------------------------------------------
    tryNotifyChange(val) {
      if (!_.isEqual(val, this.vlaue)) {
        this.$notify("change", val)
      }
    },
    //------------------------------------------------
    async evalValue() {
      //console.log("evalValue", this.value)
      let it = await this.Dict.getItem(this.value)
      if (it) {
        this.myValueIcon = this.Dict.getIcon(it)
        this.myValueText = this.Dict.getText(it)
      } else {
        this.myValueIcon = undefined
        this.myValueText = undefined
      }
    },
    //------------------------------------------------
    createDict() {
      //console.log("createDict in combo-input")
      // Customized
      return Ti.DictFactory.CreateDictBy(this.options, {
        valueBy: this.valueBy,
        textBy: this.textBy,
        iconBy: this.iconBy,
        vars: this.dictVars,
        whenLoading: ({ loading }) => {
          this.loading = loading
        }
      });
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "value": {
      handler: "evalValue",
      immediate: true
    },
    "options": function (newval, oldval) {
      if (!_.isEqual(newval, oldval)) {
        this.myDict = this.createDict()
      }
    }
  }
  ////////////////////////////////////////////////////
}
export default _M;