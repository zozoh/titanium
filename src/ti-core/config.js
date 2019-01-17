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
  //...............................

  url(path="") {
    // apply alias
    let ph = TI.alias[path] || path
    // expend prefix
    let m = /^(@([^:]+):)(.+)/.exec(ph)
    if(!m)
      return ph;
    let [prefixName, url] = m.slice(2)
    let prefix = TI.prefix[prefixName]
    if(!prefix)
      throw ti.err.make("e.ti.config.prefix_without_defined", prefixName)
    return prefix + url
  }
}

// join to namespace
ti.ns('ti.config', TiConfig)
///////////////////////
})();
