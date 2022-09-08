///////////////////////////////////////
const CURRENCIES = {
  "AUD": {
    token: "$",
    icon: "fas-dollar-sign",
    text: `i18n:currency-AUD`
  },
  "CAD": {
    token: "$",
    icon: "fas-dollar-sign",
    text: `i18n:currency-CAD`
  },
  "EUR": {
    token: "€",
    icon: "fas-euro-sign",
    text: `i18n:currency-EUR`
  },
  "GBP": {
    token: "£",
    icon: "fas-pound-sign",
    text: `i18n:currency-GBP`
  },
  "HKD": {
    token: "¥",
    icon: "fas-yen-sign",
    text: `i18n:currency-HKD`
  },
  "JPY": {
    token: "¥",
    icon: "fas-yen-sign",
    text: `i18n:currency-JPY`
  },
  "MOP": {
    token: "¥",
    icon: "fas-yen-sign",
    text: `i18n:currency-MOP`
  },
  "RMB": {
    token: "¥",
    icon: "fas-yen-sign",
    text: `i18n:currency-RMB`
  },
  "USD": {
    token: "$",
    icon: "fas-dollar-sign",
    text: `i18n:currency-USD`
  },
}
///////////////////////////////////////
const TiBank = {
  //-----------------------------------
  getCurrencyChar(cur = "RMB") {
    return _.get(CURRENCIES[cur], "token")
  },
  //-----------------------------------
  getCurrencyToken(cur = "RMB") {
    return _.get(CURRENCIES[cur], "token")
  },
  //-----------------------------------
  getCurrencyText(cur = "RMB") {
    return _.get(CURRENCIES[cur], "text")
  },
  //-----------------------------------
  getCurrencyIcon(cur = "RMB") {
    return _.get(CURRENCIES[cur], "icon")
  },
  //-----------------------------------
  getCurrencyList() {
    let list = []
    _.forEach(CURRENCIES, (cu, key) => {
      list.push({
        key, value: key,
        token: cu.token,
        icon: cu.icon,
        text: Ti.I18n.text(cu.text)
      })
    })
    return list
  },
  //-----------------------------------
  /**
   * Parse given input currency
   * 
   * @param {String|Number|Object} input could be Number or "100RMB"
   * @param {Number} unit indicate the cent when input is number.
   *  - `100`  : yuan : 元
   *  - `10`   : jiao : 角
   *  - `1`    : cent : 分
   * @param {String} currency default currency when input is number
   * @returns `{cent:128, yuan:1.28, currency:"RMB"}`
   */
  parseCurrency(input, { unit = 100, currency = "RMB" } = {}) {
    let cent, yuan;
    if (input && input.currency) {
      cent = input.cent
      yuan = input.yuan
      currency = input.currency
      if (Ti.Util.isNil(cent)) {
        if (Ti.Util.isNil(yuan)) {
          cent = input.value * unit
          yuan = cent * 100
        } else {
          cent = yuan * 100
        }
      } else if (Ti.Util.isNil(yuan)) {
        cent = yuan * 100
      }
    }
    // As number
    else if (_.isNumber(input)) {
      cent = Math.round(input * unit)
    }
    // Input String
    else {
      let m = /^(\d*\.?\d+)([A-Z]{3})?$/.exec(input)
      if (m) {
        // Indicate the current, then the number part should be yuan
        if (m[2]) {
          currency = m[2]
          cent = Math.round(m[1] * 100)
        }
        // Take it as number
        else {
          cent = Math.round(m[1] * unit)
        }
      }
      // Not valid currency
      else {
        cent = NaN
      }
    }

    // Eval the yuan
    yuan = cent / 100

    // Done
    return { cent, yuan, currency }
  },
  //-----------------------------------
  toYuanText(cent = 0.0, precise = 2) {
    let n = Math.round(cent)
    let y = Math.floor(n / 100)
    let c = cent - y * 100
    if (precise > 0 || c > 0) {
      return `${y}.${_.padStart(c, precise, '0')}`
    }
    return `${y}`
  },
  //-----------------------------------
  toYuanTokenText(cent = 0.0, currency="RMB", precise = 2) {
    let t = TiBank.getCurrencyToken(currency) || ""
    let n = Math.round(cent)
    let y = Math.floor(n / 100)
    let c = cent - y * 100
    if (precise > 0 || c > 0) {
      return `${t}${y}.${_.padStart(c, precise, '0')}`
    }
    return `${t}${y}`
  },
  //-----------------------------------
  isValidPayType(payType) {
    return ({
      "wx.qrcode": true,
      "zfb.qrcode": true,
      "paypal": true,
    })[payType] || false
  },
  //-----------------------------------
  getPayTypeText(payType, autoI18n = false) {
    let key = null
    if (_.isString(payType)) {
      key = `pay-by-${payType.replace(".", "-")}`
    }
    if (key)
      return autoI18n
        ? Ti.I18n.get(key)
        : key
  },
  //-----------------------------------
  getPayTypeChooseI18nText(payType, {
    text = 'pay-step-choose-tip2',
    nil = 'pay-step-choose-nil'
  } = {}) {
    let ptt = Ti.Bank.getPayTypeText(payType, true)
    if (ptt) {
      return Ti.I18n.getf(text, { val: ptt })
    }
    return Ti.I18n.get(nil)
  }
  //-----------------------------------
}
///////////////////////////////////////
export const Bank = TiBank

