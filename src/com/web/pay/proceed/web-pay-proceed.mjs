const _M = {
  //////////////////////////////////////////////////
  data : ()=>({
    __WS : null,   // The handle of websocket
    orderPayment: {}
  }),
  //////////////////////////////////////////////////
  props : {
    "watchUser" : {
      type : String,
      default : null
    },
    "payType" : {
      type : String,
      default : null
    },
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "orderId" : {
      type : String,
      default : undefined
    },
    "payOk" : {
      type : Boolean,
      default : undefined
    }
  },
  //////////////////////////////////////////////////
  computed : {
    TopClass() {
      return this.getTopClass({
        "has-paytype": this.hasPayType,
        "nil-paytype": !this.hasPayType
      })
    },
    //----------------------------------------------
    hasPayType() {
      return Ti.Bank.isValidPayType(this.payType)
    },
    //----------------------------------------------
    PayTypeText() {
      return Ti.Bank.getPayTypeChooseI18nText(this.payType, {
        text:'pay-step-proceed-tip',
        nil:'pay-step-proceed-nil'
      })
    },
    //----------------------------------------------
    isQRCODE() {
      return "QRCODE" == this.orderPayment.dataType
    },
    isIFRAME() {
      return "IFRAME" == this.orderPayment.dataType
    },
    isLINK() {
      return "LINK" == this.orderPayment.dataType
    },
    isJSON() {
      return "JSON" == this.orderPayment.dataType
    },
    isTEXT() {
      return "TEXT" == this.orderPayment.dataType
    },
    paymentData() {
      return this.orderPayment.data
    },
    paymentDataAsQrcodeUrl() {
      return `/gu/qrcode?d=${this.orderPayment.data}&s=${this.qrcodeSize}&_=${Date.now()}`
    },
    theTip() {
      return ({
        "wx.qrcode"  : "pay-tip-wx-qrcode",
        "zfb.qrcode" : "pay-tip-zfb-qrcode"
      })[this.payType]
        || "pay-by-nil"
    },
    checkBtnIcon(){
      return "zmdi-assignment-check"
    },
    checkBtnText(){
      return "i18n:pay-check-do"
    }
  },
  //////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    onClickCheckBtn() {
      this.$notify("pay-check")
    },
    //----------------------------------------------
    async watchPaymentChanged() {
      // Guard
      if(this.__WS 
        || !this.watchUser 
        || !this.orderData 
        || !this.orderData.pay_id) {
        return
      }
      // Watch Remote
      this.__WS = Ti.Websocket.listenRemote({
        watchTo : {
          method : "watch",
          user   : this.watchUser,
          match  : {
            id : this.orderData.pay_id
          }
        },
        received : (wso)=>{
          console.log("websocket", wso)
          this.onClickCheckBtn()
        },
        closed : ()=>{
          this.unwatchPaymentChanged()
        }
      })
    },
    //----------------------------------------------
    unwatchPaymentChanged() {
      if(this.__WS) {
        this.__WS.close();
      }
    }
    //----------------------------------------------
  },
  //////////////////////////////////////////////////
  watch : {
    "orderData.st" : function() {
      if(/^(OK|FAIL)$/.test(this.orderData.st)) {
        this.$notify("pay-done")
      }
    }
  },
  //////////////////////////////////////////////////
  mounted : function() {
    this.$notify("change:title", this.PayTypeText)
  },
  //////////////////////////////////////////////////
  beforeDestroy : function(){
    this.unwatchPaymentChanged()
  }
  //////////////////////////////////////////////////
}
export default _M;