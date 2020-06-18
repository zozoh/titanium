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
    CurrencyChar(){
      return Ti.Bank.getCurrencyChar(this.currency)
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
    TotalFee() {
      let fee = 0;
      _.forEach(this.TheItems, it=>fee+=(it.price*it.amount))
      return Ti.Num.precise(fee)
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