export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "base" : {
      type : String,
      default : "/gu/rs/ti/icons/png/"
    },
    "options" : {
      type : Array,
      default : ()=>[
        {"icon":"wxpay256.png",  "value":"wx.qrcode",  "text":"i18n:pay-wx"},
        {"icon":"alipay256.png", "value":"zfb.qrcode", "text":"i18n:pay-zfb"}]
      // default : ()=>[
      //   {"icon":"fab-weixin",  "value":"wx.qrcode",  "text":"i18n:pay-wx"},
      //   {"icon":"fab-alipay", "value":"zfb.qrcode", "text":"i18n:pay-zfb"}]
    },
    "value" : {
      type : String,
      default : null
    },
    "apiName" : {
      type : String,
      default : null
    },
    "orderStatusOk" : {
      type : Boolean,
      default : false
    }
  },
  //////////////////////////////////////////
  computed : {
    payTypeText() {
      return ({
        "wx.qrcode"  : "pay-by-wx-qrcode",
        "zfb.qrcode" : "pay-by-zfb-qrcode"
      })[this.value]
        || "pay-by-nil"
    },
    btnClass() {
      if(this.value) {
        return "is-enabled"
      }
      return "is-disabled"
    }
  },
  //////////////////////////////////////////
  methods : {
    onClickBtn() {
      if(this.value) {
        this.$emit("pay-buy")
      }
    }
  },
  //////////////////////////////////////////
  watch : {
    "orderStatusOk" : function(){
      if(this.orderStatusOk) {
        this.$emit("pay-ready")
      }
    }
  }
  //////////////////////////////////////////
}