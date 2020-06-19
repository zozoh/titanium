export default {
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
  }
}