import {Ti} from "./ti.mjs"
//-----------------------------------
const CONFIG = {
  prefix  : {},
  alias   : {},
  suffix  : {},
  comDecorator : null
}
//-----------------------------------
class AliasMapping {
  constructor(alias) {
    this.list = []
    this.reset(alias)
  }
  reset(alias={}) {
    _.forOwn(alias, (val, key)=>{
      this.list.push({
        regex  : new RegExp(key),
        newstr : val
      })
    })
    return this
  }
  get(url="", dft) {
    let u2 = url
    for(let li of this.list) {
      if(li.regex.test(u2)){
        u2 = u2.replace(li.regex, li.newstr)
      }
    }
    return u2 || (_.isUndefined(dft) ? url : dft)
  }
}
const ALIAS = new AliasMapping().reset()
//-----------------------------------
class SuffixMapping {
  constructor(suffix) {
    this.list = []
    this.reset(suffix)
  }
  reset(suffix={}) {
    _.forOwn(suffix, (val, key)=>{
      // console.log("suffix", key, val)
      this.list.push({
        regex  : new RegExp(key),
        suffix : val
      })
    })
    return this
  }
  get(url="", dft) {
    let u2 = url
    for(let li of this.list) {
      if(li.regex.test(u2) && !u2.endsWith(li.suffix)){
        u2 += li.suffix
        break
      }
    }
    return u2 || (_.isUndefined(dft) ? url : dft)
  }
}
const SUFFIX = new SuffixMapping().reset()
//-----------------------------------
export const TiConfig = {
  AliasMapping,
  //.................................
  version() {
    return CONFIG.version
  },
  //.................................
  set({prefix, alias, suffix, lang, comDecorator}={}) {
    if(prefix)
      CONFIG.prefix = prefix

    if(alias) {
      CONFIG.alias = alias
      ALIAS.reset(CONFIG.alias)
    }

    if(suffix) {
      CONFIG.suffix = suffix
      SUFFIX.reset(CONFIG.suffix)
    }

    if(lang)
      CONFIG.lang = lang

    if(comDecorator)
      CONFIG.comDecorator = comDecorator
  },
  //.................................
  update({prefix, alias, suffix, lang, comDecorator}={}) {
    if(prefix)
      _.assign(CONFIG.prefix, prefix)

    if(alias) {
      _.assign(CONFIG.alias, alias)
      ALIAS.reset(CONFIG.alias)
    }

    if(suffix) {
      _.assign(CONFIG.suffix, suffix)
      SUFFIX.reset(CONFIG.suffix)
    }

    if(lang)
      CONFIG.lang = lang

    if(comDecorator)
      CONFIG.comDecorator = comDecorator
  },
  //.................................
  get(key=null) {
    if(key) {
      return _.get(CONFIG, key);
    }
    return CONFIG;
  },
  //...............................
  decorate(com) {
    //console.log("!!!decorate(com)", com)
    // push the computed prop to get the name
    let comName = com.name || "Unkown"
    Ti.Util.pushValue(com, "mixins", {
      computed : {
        tiComType : ()=>comName
      }
    })
    // Customized Decorator
    if(_.isFunction(CONFIG.comDecorator)) {
      CONFIG.comDecorator(com)
    }

    // inner-components
    if(com && com.components) {
      _.forEach(com.components, (subCom)=>{
        //CONFIG.comDecorator(subCom)
        TiConfig.decorate(subCom)
      })
    }
  },
  //...............................
  lang() {
    return TiConfig.get("lang") || "zh-cn"
  },
  //...............................
  url(path="", {dynamicPrefix={}, dynamicAlias}={}) {
    // apply alias
    let ph, m
    //.........................................
    // amend the url dynamically
    if(dynamicAlias) {
      let a_map = (dynamicAlias instanceof AliasMapping) 
                    ? dynamicAlias 
                    : new AliasMapping().reset(dynamicAlias)
      ph = a_map.get(path, null)
    }
    // amend the url statictly
    ph = ALIAS.get(ph || path)
    //.........................................
    // expend suffix
    if(!/^.+\.(css|js|mjs|json|txt|text|html|xml)$/.test(ph)) {
      ph = SUFFIX.get(ph)
    }
    //.........................................
    // expend prefix
    m = /^(@([^:]+):?)(.*)/.exec(ph)
    if(!m)
      return ph;
    let [prefixName, url] = m.slice(2)
    let prefix = dynamicPrefix[prefixName] || CONFIG.prefix[prefixName]

    if(!prefix)
      throw Ti.Err.make("e-ti-config-prefix_without_defined", prefixName)
    //.........................................
    return prefix + url
  }
}
//-----------------------------------
export default TiConfig