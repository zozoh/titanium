const _M = {
  /////////////////////////////////////////////////
  props : {
    "options" : {
      type : Array,
      default : ()=>[{
          "icon":"/gu/rs/ti/icons/png/wxpay256.png",  
          "value":"wx.qrcode",
          "text":"i18n:pay-wx"
        }, {
          "icon":"/gu/rs/ti/icons/png/alipay256.png",
          "value":"zfb.qrcode",
          "text":"i18n:pay-zfb"
        }]
    },
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
      return !_.isEmpty(this.PayType)
    },
    //----------------------------------------------
    PayType() {
      return ({
        "wx.qrcode"  : "pay-by-wx-qrcode",
        "zfb.qrcode" : "pay-by-zfb-qrcode",
        "paypal" : "pay-by-paypal"
      })[this.value]
    },
    //----------------------------------------------
    PayTypeText() {
      if(this.hasPayType) {
        let ptt = Ti.I18n.get(this.PayType)
        return Ti.I18n.getf('pay-step-choose-tip2', {
          val:ptt
        })
      }
      return Ti.I18n.get('pay-step-choose-nil')

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
  }
  //////////////////////////////////////////////////
}
export default _M;