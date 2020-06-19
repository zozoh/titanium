const _M = {
  ///////////////////////////////////////////////////
  data: ()=>({
    myPayment: {
      payType: null,
      //payType: "wx.qrcode",
      orderId: null,
      payOk: undefined,
      errMsg: null
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
        next: true,
        comType: "WebPayCheckout",
        comConf: {
          tipIcon: this.tipIcon,
          tipText: this.tipText,
          items: this.items,
          currency: this.currency
        }
      }, {
        title: "i18n:pay-step-choose-title",
        prev : true,
        next : {
          enabled: {
            payType: "notBlank"
          }
        },
        comType: "WebPayChoose",
        comConf: {
          options: this.options,
          value: "=payType"
        }
      }, {
        title: "i18n:pay-step-proceed-title",
        prev : true,
        next : {
          enabled: {
            payOk: "isBoolean",
            orderId: "notBlank"
          }
        },
        comType: "WebPayProceed",
        comConf: {
          items: this.items,
          currency: this.currency,
          payType: "=payType",
          orderId: "=orderId",
          payOk: "=payOk",
        }
      }, {
        title: "pay-step-done-title",
        comType: "WebPayDone",
        comConf: {
          payOk: "=payOk",
          errMsg: "=errMsg",
          orderId: "=orderId",
          okIcon: this.okIcon,
          okText: this.okText,
          okLinks: this.okLinks,
          failIcon: this.failIcon,
          failText: this.failText,
          failLinks: this.failLinks,
          doneLinks: this.doneLinks
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