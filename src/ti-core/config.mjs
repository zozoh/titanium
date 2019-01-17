import {ti} from "./ti.mjs"
//-----------------------------------
const TI = {
  version : "1.0",
  prefix  : {},
  alias   : {},
  dynamicPrefix : {}
}
//-----------------------------------
class AliasMapping {
  constructor(alias) {
    this.list = []
  }
  reset(alias=TI.alias) {
    console.log("alias", alias)
    return this
  }
}
const ALIAS = new AliasMapping().reset()
//-----------------------------------
export const TiConfig = {
  //.................................
  set({prefix, alias, dynamicPrefix={
    module : "my-mod", component : "my-com"
  }}={}) {
    if(prefix)
      TI.prefix = prefix
    if(alias)
      TI.alias = alias
    if(dynamicPrefix)
      TI.dynamicPrefix = dynamicPrefix
    
    ALIAS.reset()
  },
  //.................................
  update({prefix, alias, dynamicPrefix={
    module : "my-mod", component : "my-com"
  }}={}) {
    if(prefix)
      _.assign(TI.prefix, prefix)
    if(alias)
      _.assign(TI.alias, alias)
    if(dynamicPrefix)
      _.assign(TI.dynamicPrefix, dynamicPrefix)

    ALIAS.reset()
  },
  //.................................
  get(key=null) {
    if(key) {
      return _.get(TI, key);
    }
    return TI;
  },
  //...............................
  url(path="", dynamic={}) {
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
//-----------------------------------
export default TiConfig