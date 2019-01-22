import {Ti} from "./ti.mjs"
//-----------------------------------
const CONFIG = {
  prefix  : {},
  alias   : {}
}
//-----------------------------------
class AliasMapping {
  constructor(alias) {
    this.list = []
  }
  reset(alias=CONFIG.alias) {
    _.forOwn(alias, (val, key)=>{
      // console.log("alias", key, val)
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
  get(url="", dft) {
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
    return _.isUndefined(dft) ? url : dft
  }
}
const ALIAS = new AliasMapping().reset()
//-----------------------------------
export const TiConfig = {
  //.................................
  version() {
    return CONFIG.version
  },
  //.................................
  set({prefix, alias}) {
    if(prefix)
      CONFIG.prefix = prefix
    if(alias)
      CONFIG.alias = alias
    
    ALIAS.reset()
  },
  //.................................
  update({prefix, alias}) {
    if(prefix)
      _.assign(CONFIG.prefix, prefix)
    if(alias)
      _.assign(CONFIG.alias, alias)

    ALIAS.reset()
  },
  //.................................
  get(key=null) {
    if(key) {
      return _.get(CONFIG, key);
    }
    return CONFIG;
  },
  //...............................
  url(path="", {dynamicPrefix={},dynamicAlias}={}) {
    // apply alias
    let ph, m
    if(dynamicAlias) {
      let a_map = (dynamicAlias instanceof AliasMapping) 
                    ? dynamicAlias 
                    : new AliasMapping().reset(dynamicAlias)
      ph = a_map.get(path, null)
    }
    if(!ph) {
      ph = ALIAS.get(path)
    }

    // expend prefix
    m = /^(@([^:]+):)(.*)/.exec(ph)
    if(!m)
      return ph;
    let [prefixName, url] = m.slice(2)
    let prefix = dynamicPrefix[prefixName] || CONFIG.prefix[prefixName]

    if(!prefix)
      throw Ti.Err.make("e.ti.config.prefix_without_defined", prefixName)
    
      return prefix + url
  }
}
//-----------------------------------
export default TiConfig