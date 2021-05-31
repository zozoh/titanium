const CONFIG = {
  prefix  : {},
  alias   : {},
  suffix  : {}
}
/////////////////////////////////////////////////
class AliasMapping {
  constructor(alias) {
    this.list = []
    this.reset(alias)
  }
  reset(alias={}) {
    this.list = []
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
/////////////////////////////////////////////////
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
/////////////////////////////////////////////////
const TiConfig = {
  AliasMapping,
  //.................................
  version() {
    return CONFIG.version
  },
  //.................................
  set({prefix, alias, suffix, lang }={}) {
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
  },
  //.................................
  update({prefix, alias, suffix, lang}={}) {
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
  },
  //...............................
  lang() {
    return TiConfig.get("lang") || "zh-cn"
  },
  //...............................
  cookUrl(url, {dynamicPrefix={}, dynamicAlias}={}) {
    // url prefix indicate the type
    let url2 = url

    // try type by prefix
    let type, m = /^(!(m?js|json|css|text):)?(.+)$/.exec(url)
    if(m) {
      type = m[2]
      url2 = m[3]
    }

    let url3 = TiConfig.url(url2, {dynamicPrefix, dynamicAlias})

    // Guard
    if(!url3){
      return
    }

    // Try type by suffix
    if(!type) {
      m = /\.(m?js|css|json)$/.exec(url3)
      type = m ? m[1] : "text"
    }

    return {
      type, url: url3
    }
  },
  //...............................
  url(path="", {dynamicPrefix={}, dynamicAlias}={}) {
    //.........................................
    // Full-url, just return
    if(/^((https?:)?\/\/)/.test(path)) {
      return path
    }
    //.........................................
    // apply alias
    let ph = path
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
    let m = /^(@([^:]+):?)(.*)/.exec(ph)
    if(!m)
      return ph;
    let [prefixName, url] = m.slice(2)
    let prefix = dynamicPrefix[prefixName] || CONFIG.prefix[prefixName]
    
    // The prefix has not been supported, maybe the email suffix,
    // or other text starts with "@"
    if(!prefix) {
      //throw Ti.Err.make("e-ti-config-prefix_without_defined", prefixName)
      return
    }
    //.........................................
    let loadUrl = prefix + url
    //console.log("load::", loadUrl)
    return loadUrl
    //...........................................
  }
}
/////////////////////////////////////////////////
export const Config = TiConfig