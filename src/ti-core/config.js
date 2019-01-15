(function(){
///////////////////////
const TI = {
  version : "1.0",
  prefix  : {},
  alias   : {}
}
//-----------------------------------
const TiConfig = {
  //.................................
  set({prefix, alias}) {
    if(prefix)
      TI.prefix = prefix
    if(alias)
      TI.alias = alias
  },
  //.................................
  update({prefix, alias}) {
    if(prefix)
      _.assign(TI.prefix, prefix)
    if(alias)
      _.assign(TI.alias, alias)

    rebuild_prefix_map()
  },
  //.................................
  get(key=null) {
    if(key) {
      return _.get(TI, key);
    }
    return TI;
  },
  //.................................
  url(path="") {
    // apply alias
    let p2 = TI.alias[path] || path
    // expend prefix
    let m = /^(@([^:]+):)(.+)/.exec(p2)
    if(!m)
      return p2;
    let {px,ph} = m.slice(2)
    let p0 = TI.prefix[px]
    if(!p0)
      throw ti.err.make("e.ti.config.prefix_without_defined", px)
    return p0 + ph
  }
}

// join to namespace
ti.ns('ti.config', TiConfig)
///////////////////////
})();
