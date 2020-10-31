const TiError = {
  make(code="",data){
    let er = code
    if(_.isString(code)) {
      er = {code, data}
    }
    let msgKey = er.code.replace(/[.]/g, "-")
    let errMsg = Ti.I18n.get(msgKey)
    if(data) {
      if(_.isPlainObject(data)) {
        errMsg += " : " + JSON.stringify(data)
      } else {
        errMsg += " : " + data
      }
    }
    let errObj = new Error(errMsg.trim());
    return _.assign(errObj, er, {errMsg})
  }
}
//-----------------------------------
export const Err = TiError
