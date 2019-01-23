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
    this.reset(alias)
  }
  reset(alias={}) {
    _.forOwn(alias, (val, key)=>{
      // console.log("alias", key, val)
      // Regex
      if(_.startsWith(key, "^") || _.endsWith(key, "$")){
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
    let re = url
    for(let r of this.list) {
      // Match Regex
      if(r.regex) {
        if(r.regex.test(re)){
          re = re.replace(r.regex, r.newstr)
        }
      }
      // Match static value
      if(url == r.substr){
        re = r.newstr
      }
    }
    return re || (_.isUndefined(dft) ? url : dft)
  }
}
const ALIAS = new AliasMapping().reset()
//-----------------------------------
export const TiConfig = {
  AliasMapping,
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
    
    ALIAS.reset(CONFIG.alias)
  },
  //.................................
  update({prefix, alias}) {
    if(prefix)
      _.assign(CONFIG.prefix, prefix)
    if(alias)
      _.assign(CONFIG.alias, alias)

    ALIAS.reset(CONFIG.alias)
  },
  //.................................
  get(key=null) {
    if(key) {
      return _.get(CONFIG, key);
    }
    return CONFIG;
  },
  //...............................
  url(path="", {dynamicPrefix={}, dynamicAlias}={}) {
    // apply alias
    let ph, m

    // amend the url dynamically
    if(dynamicAlias) {
      let a_map = (dynamicAlias instanceof AliasMapping) 
                    ? dynamicAlias 
                    : new AliasMapping().reset(dynamicAlias)
      ph = a_map.get(path, null)
    }
    // amend the url statictly
    ph = ALIAS.get(ph || path)

    // expend prefix
    m = /^(@([^:]+):?)(.*)/.exec(ph)
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