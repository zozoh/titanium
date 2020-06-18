const _M = {
  /////////////////////////////////////////
  props : {
    "tipIcon": {
      type: String,
      default: "fas-clipboard-check"
    },
    "tipText": {
      type: String,
      default: "i18n:pay-checkout-tip"
    },
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "currency": {
      type: String,
      default: "RMB"
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    isEmpty() {
      return _.isEmpty(this.items)
    },
    //--------------------------------------
    TheItems() {
      let list = []
      _.forEach(this.items, it=>{
        list.push({
          ... it,
          subtotal: Ti.Num.precise(it.price * it.amount)
        })
      })
      return list
    },
    //--------------------------------------
    CurrencyChar(){
      return Ti.Bank.getCurrencyChar(this.currency)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    OnShowProduct({id}={}) {
      this.$notify("show:product", id)
    }
  }
  //////////////////////////////////////////
}
export default _M;