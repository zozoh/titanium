const _M = {
  /////////////////////////////////////////////////
  props : {
    "value" : {
      type : String,
      default : null
    }
  },
  //////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //----------------------------------------------
    hasPayType() {
      return Ti.Bank.isValidPayType(this.value)
    },
    //----------------------------------------------
    PayTypeText() {
      return Ti.Bank.getPayTypeChooseI18nText(this.value, {
        text:'pay-step-choose-tip2',
        nil:'pay-step-choose-nil'
      })
    }
    //----------------------------------------------
  },
  //////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    OnChooseOption({value}={}) {
      this.$emit("change", {
        payType: value
      })
    },
    //----------------------------------------------
    getOptionClass(op) {
      if(op.value == this.value) {
        return "is-enabled"
      }
      return "is-disabled"
    }
    //----------------------------------------------
  },
  //////////////////////////////////////////////////
  mounted() {
    this.$notify("change:title", "pay-step-choose-title2")
  }
  //////////////////////////////////////////////////
}
export default _M;