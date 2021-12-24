const _M = {
  ////////////////////////////////////////////////////
  data: () => ({
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
      default: undefined
    },
    "textBy": {
      type: [String, Function],
      default: undefined
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
    "focused": {
      type: Boolean,
      default: false
    },
    "input": {
      type: Object
    },
    "dialog": {
      type: Object
    },
    "filterlist": {
      type: Object
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "placeholder": {
      type: [String, Number],
      default: undefined
    },
    "prefixIcon": {
      type: String,
      default: "zmdi-minus"
    },
    "suffixIcon": {
      type: String,
      default: "fas-cog"
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
    InputPrefixIcon() {
      return this.myValueIcon || this.prefixIcon
    },
    //------------------------------------------------
    InputComConf() {
      return _.assign({
        readonly: this.readonly,
        focused: this.focused,
        placeholder: this.placeholder
      }, this.input)
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
    async OnClickSuffixIcon() {
      let dataList = await this.Dict.getData()

      // Prepare the filter list config
      let fltListConf = _.merge({
        className: "ti-fill-parent",
        list: {
          idBy: this.valueBy,
          data: dataList,
          currentId: this.value,
          display: [
            "<icon>",
            this.textBy || "nickname|title|text|name",
            `${this.valueBy || "value|nm|id"}::align-right as-tip-block`
          ]
        }
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
        ]
      }))

      // User Cancel
      if (!reo) {
        return
      }

      // Change the currency
      let val = reo.currentId || null
      this.$notify("change", val)
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