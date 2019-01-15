(function(){
///////////////////////
const TiError = {
  make({code="",data="",msg}){
    let er = new Error(msg || [code,reason].join(" : "))
    er.errCode = code
    er.data = data
    return er
  }
}

// join to namespace
ti.ns('ti.err', TiError)
///////////////////////
})();
