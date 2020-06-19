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

