const TiError = {
  make(code = "", data, errMsg) {
    let er = code
    if (_.isString(code)) {
      er = { code, data }
    }
    let msgKey = er.code.replace(/[.]/g, "-")
    if (!errMsg) {
      errMsg = Ti.I18n.get(msgKey)
    }
    if (!Ti.Util.isNil(data)) {
      if (_.isPlainObject(data) || _.isArray(data)) {
        errMsg += " : " + JSON.stringify(data)
      } else {
        errMsg += " : " + data
      }
    }
    let errObj = new Error(errMsg.trim());
    return _.assign(errObj, er, { errMsg })
  }
}
//-----------------------------------
export const Err = TiError
