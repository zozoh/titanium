export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "payType" : {
      type : String,
      default : null
    },
    "items" : {
      type : Array,
      default : ()=>[]
    },
    "orderStatusOk" : {
      type : Boolean,
      default : false
    },
    "orderPayment" : {
      type : Object,
      default : ()=>({})
    },
    "orderData" : {
      type : Object,
      default : ()=>({})
    },
    "qrcodeSize" : {
      type : Number,
      default : 200
    }
  },
  //////////////////////////////////////////
  computed : {
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
        "wx.qrcode"  : "pay-by-wx-qrcode",
        "zfb.qrcode" : "pay-by-zfb-qrcode"
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
  //////////////////////////////////////////
  methods : {
    onClickCheckBtn() {
      this.$emit("pay-check")
    }
  },
  //////////////////////////////////////////
  watch : {
    "orderData.st" : function() {
      if(/^(OK|FAIL)$/.test(this.orderData.st)) {
        this.$emit("pay-done")
      }
    }
  }
  //////////////////////////////////////////
}