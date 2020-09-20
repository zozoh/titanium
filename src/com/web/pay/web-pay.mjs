const _M = {
  ///////////////////////////////////////////////////
  data: ()=>({
    myPayment: {
      payType: null,
      //payType: "wx.qrcode",
      orderId: undefined,
      payOk: undefined,
      errMsg: null,
      address: null
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
    "defaultAddr": {
      type: Object,
      default: undefined
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    PaySteps() {
      return [{
        title: "i18n:pay-step-checkout-title",
        next: {
          enabled: ()=>{
            if(_.isEmpty(this.items))
              return false

            if("A" == this.orderType)
              return !_.isEmpty(this.myPayment.address)

            return true
          }
        },
        comType: "WebPayCheckout",
        comConf: {
          tipIcon: this.tipIcon,
          tipText: this.tipText,
          items: this.items,
          currency: this.currency,
          orderType: this.orderType,
          addresses: this.addresses,
          currentAddr: this.myPayment.address,
          countries : this.countries
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
          checkPaymentInterval: this.checkPaymentInterval,
          orderType: this.orderType,
          orderTitle: this.orderTitle,
          watchUser: this.watchUser,
          qrcodeSize: this.qrcodeSize,
          fetchOrder: this.fetchOrder,
          payOrder: this.payOrder,
          createOrder: this.createOrder,
          checkOrder: this.checkOrder,
          returnUrl: this.returnUrl
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
    },
    "defaultAddr" : {
      handler : function(addr) {
        if(addr && !this.myPayment.address) {
          this.myPayment.address = _.cloneDeep(addr)
        }
      },
      immediate : true
    }
  }
  ///////////////////////////////////////////////////
}
export default _M;