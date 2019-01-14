(function(){
///////////////////////
const TI = {
  version  : "1.0",
  prefixes : {},
}
//-----------------------------------
const TiConfig = {
  //.................................
  set({prefixes={}}) {
    TI.prefixes = prefixes
  },
  //.................................
  update({prefixes={}}) {
    _.assign(TI.prefixes, prefixes)
  },
  //.................................
  get(key=null) {
    if(key) {
      return _.get(TI, key);
    }
    return TI;
  }
}

// join to namespace
ti.ns('ti.config', TiConfig)
///////////////////////
})();
