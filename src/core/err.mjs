export const TiError = {
  make(code="",data="",msg){
    let er = new Error(msg || [code,data].join(" : "))
    er.errCode = code
    er.data = data
    return er
  }
}
//-----------------------------------
export default TiError
