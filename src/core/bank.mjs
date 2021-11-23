///////////////////////////////////////
const TiBank = {
  //-----------------------------------
  getCurrencyChar(cur="RMB") {
    return ({
      "RMB": "¥",
      "USD": "$",
      "GBP": "£"
    })[cur]
  },
  //-----------------------------------
  toYuanText(cent=0.0) {
    let n = Math.round(cent)
    let y = Math.floor(n/100)
    let c = cent - y * 100
    console.log(y, c)
    return `${y}.${_.padStart(c, 2, '0')}`
  },
  //-----------------------------------
  isValidPayType(payType) {
    return ({
      "wx.qrcode"  : true,
      "zfb.qrcode" : true,
      "paypal"     : true,
    })[payType] || false
  },
  //-----------------------------------
  getPayTypeText(payType, autoI18n=false) {
    let key = null
    if(_.isString(payType)) {
      key = `pay-by-${payType.replace(".", "-")}`
    }
    if(key)
      return autoI18n
        ? Ti.I18n.get(key)
        : key
  },
  //-----------------------------------
  getPayTypeChooseI18nText(payType, {
    text='pay-step-choose-tip2',
    nil='pay-step-choose-nil'
  }={}) {
    let ptt =Ti.Bank.getPayTypeText(payType, true)
    if(ptt) {
      return Ti.I18n.getf(text, {val:ptt})
    }
    return Ti.I18n.get(nil)
  }
  //-----------------------------------
}
///////////////////////////////////////
export const Bank = TiBank

