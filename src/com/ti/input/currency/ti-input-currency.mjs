export default {
  ////////////////////////////////////////////////////
  data: () => ({

  }),
  ////////////////////////////////////////////////////
  props: {
    "value": {
      type: [String, Number, Object],
      default: undefined
    },
    "valueType": {
      type: String,
      default: "str",
      validator: v => /^(str|obj|num)$/.test(v)
    },
    /*
     *  - `100`  : yuan : 元
     *  - `10`   : jiao : 角
     *  - `1`    : cent : 分
     */
    "unit": {
      type: Number,
      default: 100
    },
    /* display precision */
    // "precision": {
    //   type: Number,
    //   default: 2
    // },
    /* default currency */
    "currency": {
      type: String,
      default: "RMB"
    },
    /* currency options */
    "options": {
      type: [String, Array, Function, Ti.Dict],
      default: undefined
    },
    "placeholder": {
      type: [String, Number],
      default: undefined
    },
    "autoSelect": {
      type: Boolean,
      default: true
    },
    "readonly": {
      type: Boolean,
      default: false
    },
    "focused": {
      type: Boolean,
      default: false
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
    isCanChangeCurrency() {
      return "num" != this.valueType
    },
    //------------------------------------------------
    InputHover() {
      let hover = ['prefixIcon']
      if (this.isCanChangeCurrency) {
        hover.push("suffixText")
      }
      return hover
    },
    //------------------------------------------------
    ValObj() {
      return Ti.Bank.parseCurrency(this.value, {
        unit: this.unit,
        currency: this.currency
      })
    },
    //------------------------------------------------
    ValInput() {
      let v = this.ValObj.yuan
      if (isNaN(v)) {
        return
      }
      return v
    },
    //------------------------------------------------
    DisInput() {
      return Ti.Bank.toBankText(this.ValInput)
    },
    //------------------------------------------------
    ValCurrency() {
      return this.ValObj.currency
    },
    //------------------------------------------------
    ValIcon() {
      let cu = this.ValCurrency;
      return Ti.Bank.getCurrencyIcon(cu)
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    OnInputChange(val) {
      //console.log("Cu changed", val)
      // Get value
      let v1 = _.toUpper(_.trim(val))
      let v2 = Ti.Bank.parseCurrency(v1, {
        unit: 100,
        currency: this.ValCurrency
      })
      let v3 = this.formatValue(v2)
      this.$notify("change", v3)
    },
    //------------------------------------------------
    async OnClickSuffix() {
      // Guard
      if (!this.isCanChangeCurrency) {
        return
      }
      // Open the dialog
      let reo = await Ti.App.Open({
        title: "i18n:currency",
        position: "top",
        width: "4.8rem",
        height: "62%",
        model: { event: "select" },
        events: {
          open: function () {
            this.close(this.result)
          }
        },
        comType: "TiFilterlist",
        comConf: {
          className: "ti-fill-parent",
          filterInput: {
            valueCase: "upper"
          },
          list: {
            idBy: "value",
            data: Ti.Bank.getCurrencyList(),
            currentId: this.ValCurrency,
            cancelable: false,
            display: [
              "<icon>",
              "value::flex-none as-tip",
              "text",
              "token::align-right as-tip-block"
            ]
          }
        },
        components: [
          "@com:ti/filterlist"
        ]
      })

      // User Cancel
      if (!reo || !reo.currentId) {
        return
      }

      // Change the currency
      let currency = reo.currentId
      if (currency != this.ValCurrency) {
        let cuo = _.assign({}, this.ValObj, {
          currency
        })
        let v3 = this.formatValue(cuo)
        this.$notify("change", v3)
      }
    },
    //------------------------------------------------
    /**
     * @param {Object} cu Currency object like `{cent,yuan,currency}`
     * @return the value obey the `valueType` to notify change
     */
    formatValue(cu) {
      // Get format function
      let vt = this.valueType;
      const fn = ({
        str: ({ cent, currency }) => {
          if (isNaN(cent)) {
            return null
          }
          return `${cent / this.unit}${currency}`
        },
        obj: ({ cent, currency }) => {
          if (isNaN(cent)) {
            return null
          }
          return {
            value: cent / this.unit,
            currency
          }
        },
        num: ({ cent }) => {
          if (isNaN(cent)) {
            return
          }
          return cent / this.unit
        }
      })[vt]
      // Get value
      return fn(cu)
    },
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}