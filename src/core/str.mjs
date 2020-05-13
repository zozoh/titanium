export const TiStr = {
  sBlank(str, dft) {
    return str || dft
  },
  isBlank(str) {
    return /^\s*$/.test(str)
  },
  renderVars(vars={}, fmt="", {
    iteratee, 
    regex, 
    safe
  }={}) {
    if(_.isString(vars) || _.isNumber(vars)) {
      vars = {val:vars}
    }
    if(!vars || _.isEmpty(vars)){
      return _.isArray(vars) ? [] : ""
    }
    return TiStr.renderBy(fmt, vars, {
      iteratee, regex, safe
    })
  },
  /***
   * Replace the placeholder
   */
  renderBy(str="", vars={}, {
    iteratee, 
    regex=/(\${1,2})\{([^}]+)\}/g,
    safe=false
  }={}) {
    if(!str){
      return _.isArray(vars) ? [] : ""
    }
    // Make sure the `vars` empty-free
    vars = vars || {}
    if(safe) {
      let r2 = _.isRegExp(safe) ? safe : undefined
      vars = TiStr.safeDeep(vars, r2)
    }
    // Normlized args
    if(_.isRegExp(iteratee)) {
      regex = iteratee
      iteratee = undefined
    }
    // Default iteratee
    if(!iteratee) {
      iteratee = ({varName, vars, matched}={})=>{
        if(matched.startsWith("$$")) {
          return matched.substring(1)
        }
        // find default
        let dft = matched
        let pos = varName.indexOf('?')
        if(pos > 0) {
          dft = _.trim(varName.substring(pos+1))
          varName = _.trim(varName.substring(0, pos))
        }
        // pick value
        return Ti.Util.fallback(
          Ti.Util.getOrPick(vars, varName),
          dft
        )
      }
    }
    // Array
    if(_.isArray(vars)) {
      let re = []
      for(let i=0; i<vars.length; i++) {
        let vars2 = vars[i]
        let s2 = TiStr.renderBy(str, vars2)
        re.push(s2)
      }
      return re
    }
    // Looping
    let m
    let ss = []
    let last = 0
    while(m=regex.exec(str)){
      let current = m.index
      if(current > last) {
        ss.push(str.substring(last, current))
      }
      let varValue = iteratee({
        vars,
        matched : m[0],
        prefix  : m[1], 
        varName : m[2]
      })
      ss.push(varValue)
      last = regex.lastIndex
    }
    // Add tail
    if(last < str.length) {
      ss.push(str.substring(last))
    }
    // Return
    return ss.join("")
  },
  /***
   * Replace the dangerous char in Object deeply.
   * 
   * @param data{Array|Object|Any} : the value to be turn to safe
   * @param regex{RegExp} : which char should be removed
   * 
   * @return data
   */
  safeDeep(data={}, regex=/['"]/g) {
    // String to replace
    if(_.isString(data)) {
      return data.replace(regex, "")
    }
    // Array
    else if(_.isArray(data)) {
      return _.map(data, (v)=>this.safeDeep(v, regex))
    }
    // Object
    else if(_.isPlainObject(data)) {
      return _.mapValues(data, (v)=>this.safeDeep(v, regex))
    }
    // Others return
    return data
  },
  /***
   * Join without `null/undefined`
   */
  join(sep="", ...ss){
    let list = []
    for(let s of ss) {
      if(_.isUndefined(s) || _.isNull(s))
        continue
      if(_.isArray(s)) {
        list.push(...s)
        continue
      }
      list.push(s)
    }
    return list.join(sep)
  },
  /***
   * Convert string to Js Object automatictly
   */
  toJsValue(v="", {
    autoJson=true,
    autoDate=true,
    autoNil=false,
    trimed=true,
    context={}
  }={}) {
    //...............................................
    // Array 
    if(_.isArray(v)) {
      let re = []
      let opt = {autoJson,autoDate,autoNil,trimed,context}
      for(let it of v) {
        let v2 = TiStr.toJsValue(it, opt)
        re.push(v2)
      }
      return re
    }
    //...............................................
    // Object
    if(_.isPlainObject(v)) {
      let re = {}
      let opt = {autoJson,autoDate,autoNil,trimed,context}
      _.forEach(v, (it, key)=>{
        let v2 = TiStr.toJsValue(it, opt)
        re[key] = v2
      })
      return re
    }
    //...............................................
    // Number
    // Boolean
    // Nil
    if(Ti.Util.isNil(v)
      || _.isBoolean(v)
      || _.isNumber(v)) {
      return v
    }
    //...............................................
    // Must by string
    let str = trimed ? _.trim(v) : v
    //...............................................
    // autoNil
    if(autoNil) {
      if("undefined" == str)
        return undefined
      if("null" == str)
        return null
    }
    //...............................................
    // Number
    if (/^-?[\d.]+$/.test(str)) {
        return str * 1;
    }
    //...............................................
    // Try to get from context
    let re = _.get(context, str)
    if(!_.isUndefined(re)) {
      return re
    }
    //...............................................
    // Boolean
    if(/^(true|false|yes|no|on|off)$/i.test(str)) {
      return /^(true|yes|on)$/i.test(str)
    }
    //...............................................
    // JS String
    let m = /^'([^']*)'$/.exec(str)
    if(m){
      return m[1]
    }
    //...............................................
    // try JSON
    if(autoJson) {
      let re = Ti.Types.safeParseJson(v)
      if(!_.isUndefined(re)) {
        return re
      }
    }
    //...............................................
    // try Date
    if(autoDate) {
      try {
        return Ti.Types.toDate(v)
      } catch(E){}
    }
    // Then, it is a string
    return str
  },
  /***
   * Join "a,b,c" like string to arguments
   */
  joinArgs(s, args=[], iteratee=TiStr.toJsValue) {
    // String to split
    if(_.isString(s)) {
      let list = s.split(",")
      for(let li of list) {
        let vs = _.trim(li)
        if(!vs)
          continue
        let v = iteratee(vs)
        args.push(v)
      }
      return args
    }
    // Array
    else if(_.isArray(s)) {
      for(let v of s) {
        let v2 = iteratee(v)
        args.push(v2)
      }
    }
    // Others
    else if(!_.isUndefined(s)){
      args.push(s)
    }
    return args
  },
  /***
   * @param s{String|Array}
   * @param sep{RegExp|String}
   * @param ignoreNil{Boolean}
   */
  toArray(s, {
    sep=/[:,;\t\n\/]+/g,
    ignoreNil=true
  }={}){
    // Nil
    if(Ti.Util.isNil(s)) {
      return []
    }
    // Array
    if(_.isArray(s)) {
      return s
    }
    // String to split
    if(_.isString(s)) {
      let ss = _.map(s.split(sep), v => _.trim(v))
      if(ignoreNil) {
        return _.without(ss, "")
      }
      return ss
    }
    // Others -> wrap
    return [s]
  },
  /***
   * Translate "XXX:A:im-pizza" or ["XXX","A","im-pizza"]
   * 
   * ```
   * {text:"XXX",value:"A",icon:"im-pizza"}
   * ```
   * 
   * @param s{String|Array}
   * @param sep{RegExp|String}
   * @param ignoreNil{Boolean}
   * @param keys{Array}
   */
  toObject(s, {
    sep=/[:,;\t\n\/]+/g, 
    ignoreNil=true,
    keys=["value","text?value","icon"]
  }={}) {
    // Already Object
    if(_.isPlainObject(s) || _.isNull(s) || _.isUndefined(s)) {
      return s
    }
    // Split value to array
    let vs = TiStr.toArray(s, {sep, ignoreNil})

    // Analyze the keys
    let a_ks = []   // assign key list
    let m_ks = []   // those keys must has value
    _.forEach(keys, k => {
      let ss = TiStr.toArray(k, {sep:"?"})
      if(ss.length > 1) {
        let k2 = ss[0]
        a_ks.push(k2)
        m_ks.push({
          name   : k2,
          backup : ss[1]
        })
      } else {
        a_ks.push(k)
      }
    })
    
    // translate
    let re = {}
    _.forEach(a_ks, (k, i)=>{
      let v = _.nth(vs, i)
      if(_.isUndefined(v) && ignoreNil) {
        return
      }
      re[k] = v
    })
    // Assign default
    for(let mk of m_ks) {
      if(_.isUndefined(re[mk.name])) {
        re[mk.name] = re[mk.backup]
      }
    }

    // done
    return re
  },
  /***
   * String (multi-lines) to object list
   * Translate 
   * ```
   * A : Xiaobai : im-pizza
   * B : Peter
   * C : Super Man
   * D
   * ```
   * To
   * ```
   * [
   *  {value:"A", text:"Xiaobai", icon:"im-pizza"},
   *  {value:"B", text:"Peter"},
   *  {value:"C", text:"Super Man"}
   *  {value:"D", text:"C"}
   * ]
   * ```
   * 
   * @param s{String|Array}
   * @param sep{RegExp|String}
   * @param ignoreNil{Boolean}
   * @param keys{Array}
   */
  toObjList(s, {
    sepLine=/[,;\n]+/g, 
    sepPair=/[:|\/\t]+/g, 
    ignoreNil=true,
    keys=["value","text?value","icon"]
  }={}) {
    let list = TiStr.toArray(s, {sep:sepLine, ignoreNil})
    return _.map(list, v => TiStr.toObject(v, {
      sep : sepPair,
      ignoreNil, keys
    }))
  },
  /***
   * Get the display text for bytes
   */
  sizeText(byte=0, {
    fixed=2, M=1024, 
    units=["Bytes","KB","MB","GB","PB","TB"]}={}) {
    let nb = byte
    let i = 0;
    for(; i<units.length; i++) {
      let nb2 = nb / M
      if(nb2 < 1) {
        break;
      }
      nb = nb2
    }
    let unit = units[i]
    if(nb == parseInt(nb)) {
      return nb + unit
    }
    return nb.toFixed(fixed)+unit
  },
  /***
   * Get the display percent text for a float number
   * @param n Float number
   */
  toPercent(n, {fixed=2, auto=true}={}){
    if(!_.isNumber(n))
      return "NaN"
    let nb = n * 100
    // Round
    let str = fixed >= 0 ? nb.toFixed(fixed) : (nb+"")
    if(auto) {
      let lastDot  = str.lastIndexOf('.')
      let lastZero = str.lastIndexOf('0')
      if(lastDot >=0 && lastZero>lastDot) {
        let last = str.length-1
        let pos  = last
        for(; pos>=lastDot; pos--){
          if(str[pos] != '0')
            break
        }
        if(pos==lastZero || pos==lastDot) {
          //pos --
        }
        else {
          pos ++
        }
        if(pos < str.length)
          str = str.substring(0, pos)
      }
    }
    return str + "%"
  },
  /***
   * switch given `str` to special case, the modes below would be supported:
   * 
   * @param str{String} - give string
   * @param mode{String} - Method of key name transformer function:
   *  - `"upper"` : to upport case
   *  - `"lower"` : to lower case
   *  - `"camel"` : to camel case
   *  - `"snake"` : to snake case
   *  - `"kebab"` : to kebab case
   *  - `"start"` : to start case
   *  - `null`  : keep orignal
   * 
   * @return string which applied the case mode
   */
  toCase(str, mode) {
    // Guard
    if(Ti.Util.isNil(str))
      return str
    // Find mode
    let fn = TiStr.getCaseFunc(mode)
    // Apply mode
    if(_.isFunction(fn)) {
      return fn(str)
    }
    return str
  },
  getCaseFunc(mode) {
    return ({
      upper : (s)=>s ? s.toUpperCase() : s,
      lower : (s)=>s ? s.toLowerCase() : s,
      camel : (s)=>_.camelCase(s),
      snake : (s)=>_.snakeCase(s),
      kebab : (s)=>_.kebabCase(s),
      start : (s)=>_.startCase(s),
    })[mode]
  },
  isValidCase(mode) {
    return _.isFunction(TiStr.getCaseFunc(mode))
  },
  /***
   * Check given string is phone number or not
   */
  isPhoneNumber(s="") {
    return /^(\+\d{2})? *(\d{11})$/.test(s)
  }
}
//-----------------------------------
export default TiStr
