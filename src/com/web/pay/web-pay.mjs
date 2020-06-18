const _M = {
  ///////////////////////////////////////////////////
  data: ()=>({
    myValue: {}
  }),
  ///////////////////////////////////////////////////
  props : {
    "title": {
      type: String,
      default: "i18n:pay-title"
    },
    /**
     * Items Array should like:
     * {
     *   id: "xxx",      // Item ID
     *   title: "xxx",   // Item display name
     *   price: 34,      // Item price
     *   amount: 2,      // Buy number
     *   thumbSrc        // [optional] Item preview src
     *   href            // [optional] Item link
     * }
     */
    "items" : {
      type: Array,
      default: ()=>[]
    },
    "currency": {
      type: String,
      default: "RMB"
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    PaySteps() {
      return [{
        title: "i18n:pay-step-checkout-title",
        comType: "WebPayCheckout",
        comConf: {
          items: this.items,
          currency: this.currency
        }
      }]
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    
  },
  ///////////////////////////////////////////////////
  watch: {
    
  }
  ///////////////////////////////////////////////////
}
export default _M;