const _M = {
  ///////////////////////////////////////////////////
  data: ()=>({
    myPayment: {
      payType: null
      //payType: "wx.qrcode"
    }
  }),
  ///////////////////////////////////////////////////
  props : {
    "title": {
      type: String,
      default: "i18n:pay-title"
    },
    "payType": {
      type: String,
      default: null
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
    },
    "payTypeOptions" : {
      type : Array,
      default : undefined
    },
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
      }, {
        title: "i18n:pay-step-choose-title",
        prev : true,
        next : {
          enabled: {
            payType: "!isBlank"
          }
        },
        comType: "WebPayChoose",
        comConf: {
          options: this.payTypeOptions,
          value: "=payType"
        }
      }]
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    OnChange(payment) {
      _.assign(this.myPayment, payment)
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch: {
    "payType": {
      handler: function(){
        this.myPayment.payType = this.payType
      },
      immediate: true
    }
  }
  ///////////////////////////////////////////////////
}
export default _M;