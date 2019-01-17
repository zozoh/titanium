import {ti} from "./ti.mjs"
//-----------------------------------
const TI = {
  version : "1.0",
  prefix  : {},
  alias   : {}
}
//-----------------------------------
class AliasMapping {
  constructor(alias) {
    this.list = []
  }
  reset(alias=TI.alias) {
    _.forOwn(alias, (val, key)=>{
      console.log("alias", key, val)
      // Regex
      if(_.startsWith(key, "^")){
        this.list.push({
          regex  : new RegExp(key),
          newstr : val
        })
      }
      // Normal
      else {
        this.list.push({
          substr : key,
          newstr : val
        })
      }
    })
    return this
  }
  get(url="") {
    for(let r of this.list) {
      // Match Regex
      if(r.regex) {
        if(r.regex.test(url)){
          return url.replace(r.regex, r.newstr)
        }
      }
      // Match static value
      if(url == r.substr){
        return r.newstr
      }
    }
    return url
  }
}
const ALIAS = new AliasMapping().reset()
//-----------------------------------
export const TiConfig = {
  //.................................
  set({prefix, alias}) {
    if(prefix)
      TI.prefix = prefix
    if(alias)
      TI.alias = alias
    
    ALIAS.reset()
  },
  //.................................
  update({prefix, alias}) {
    if(prefix)
      _.assign(TI.prefix, prefix)
    if(alias)
      _.assign(TI.alias, alias)

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
  url(path="", dynamicPrefix={}) {
    // apply alias
    let ph = ALIAS.get(path)
    // expend prefix
    let m = /^(@([^:]+):)(.+)/.exec(ph)
    if(!m)
      return ph;
    let [prefixName, url] = m.slice(2)
    let prefix = dynamicPrefix[prefixName] || TI.prefix[prefixName]
    if(!prefix)
      throw ti.err.make("e.ti.config.prefix_without_defined", prefixName)
    return prefix + url
  }
}
//-----------------------------------
export default TiConfig