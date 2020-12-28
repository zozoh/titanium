import TiPaths from "./util-paths.mjs"
import TiLink from "./util-link.mjs"
//---------------------------------------
const TiUtil = {
  ...TiPaths, ...TiLink,
  /***
   * Merge an plain object by gived arguments deeply.
   * 
   * @param obj{Object} : the object to be merged with
   * @param args{...<Any>} : the value that will be merged to `obj`
   *   For each argument passed on, here is the treatment:
   *   + `Object` : merge to the result by `_.assign`
   *   + `Function` : set to result, `name` as the key
   *   + `Array` : merget to `obj` recursively
   *   + Another simple object like *Boolean|String|Number...* will be ignore
   * @return
   *  The `obj` which be passed on.
   */
  merge(obj={}, ...args){
    return TiUtil.mergeWith(undefined, obj, ...args)
  },
  mergeWith(customizer=_.identity, obj={}, ...args) {
    const list = _.flattenDeep(args)
    for(let arg of list) {
      if(!arg) {
        continue
      }
      let val = customizer(arg)
      // Array
      if(_.isArray(val)) {
        TiUtil.merge(obj, ...val)
      }
      // Function
      else if(_.isFunction(val)) {
        obj[val.name] = val
      }
      // Plain Object
      else if(_.isPlainObject(val)) {
        _.merge(obj, val)
      }
      // Another types will be ignore
    }
    return obj
  },
  /***
   * Unlike the `_.merge`, it will replace `Array` value
   */
  deepMergeObj(obj={}, ...others) {
    return _.mergeWith(obj, ...others, (objValue, srcValue)=>{
      if(_.isArray(objValue) || _.isArray(srcValue)) {
        return srcValue
      }
    })
  },
  /***
   * Group a given list to map by special key
   */
  grouping(list=[], groupKey, {
    titles=[],
    otherTitle={value:"Others",text:"Others"},
    asList=false
  }={}) {
    let reMap  = {}
    //...............................................
    // Build title map
    let titleMap = []
    _.forEach(titles, tit => {
      if(tit.text && !Ti.Util.isNil(tit.value)) {
        titleMap[tit.value] = tit
      }
    })
    //...............................................
    let others = []
    //...............................................
    _.forEach(list, li => {
      let gk = _.get(li, groupKey)
      if(!gk) {
        others.push(li)
      } else {
        let tit = titleMap[gk] || {text:gk, value:gk}
        let grp = reMap[gk]
        if(!grp) {
          grp = {
            ...tit,
            list:[]
          }
          reMap[gk] = grp
        }
        grp.list.push(li)
      }
    })
    //...............................................
    if(!_.isEmpty(others)) {
      reMap[otherTitle.value] = {
        ... otherTitle, list: others
      }
    }
    //...............................................
    if(asList) {
      return _.values(reMap)
    }
    return reMap
  },
  /***
   * Insert one or more elements into specific position of list.
   * It will mutate the given list.
   * 
   * @param list{Array} - target list
   * @param pos{Integer} - 
   *   specific position. 
   *    `0` : the head, 
   *    `-1`: the tail, 
   *    `-2`: before the last lement
   * @param items{Array} - one or more elements
   * 
   * @return the index which to insert the items
   */
  insertToArray(list=[], pos=-1, ...items) {
    // Guard
    if(!_.isArray(list) || _.isEmpty(items))
      return -1

    // Empty array
    if(_.isEmpty(list)) {
      list.push(...items)
      return 0
    }

    // Find the position
    let index = Ti.Num.scrollIndex(pos, list.length+1)

    // At the tail
    if(list.length == index) {
      list.push(...items)
    }
    // Insert before the index
    else {
      list.splice(index, 0, ...items)
    }

    // done
    return index
  },
  /***
   * Insert one or more elements after specific position of object.
   * It will return new object.
   * 
   * @param list{Array} - target object
   * @param key{String} - the anchor key
   * @param items{Object} - new data to add
   * 
   * @return number or pair to add
   */
  appendToObject(obj={}, key=null, data={}) {
    let stub = {}
    // Insert after key
    if(!Ti.Util.isNil(key)) {
      _.forEach(obj, (v, k)=>{
        stub[k] = v
        if(key == k) {
          _.assign(stub, data)
        }
      })
    }
    // Just add to obj
    else {
      _.assign(stub, obj, data)
    }
    
    return stub
  },
  /***
   * @param input{Any}
   * @param iteratee{Function} - (val, path) 
   */
  walk(input={}, {
    root = _.identity,
    all  = _.identity,
    leaf = _.identity,
    node = _.identity,
  }={}) {
    //..............................
    const WalkAny = (input, path=[])=>{
      let isArray = _.isArray(input)
      let isPojo  = _.isPlainObject(input)

      all(input, path)

      // For Node
      if(isArray || isPojo) {
        if(_.isEmpty(path)) {
          root(input, path)
        }
        else {
          node(input, path)
        }
      }
      // For Leaf
      else {
        leaf(input, path)
      }

      // Array
      if(isArray) {
        for(let i=0; i<input.length; i++) {
          let val = input[i]
          let ph  = path.concat(i)
          WalkAny(val, ph)
        }
      }
      // Object
      else if(isPojo) {
        let keys = _.keys(input)
        for(let k of keys) {
          let val = input[k]
          let ph  = path.concat(k)
          WalkAny(val, ph)
        }
      }
    }
    //..............................
    WalkAny(input)
    //..............................
  },
  /***
   * Pick the object from source account the data
   */
  // pickDeep(src={}, data={}) {
  //   let keys = TiUtil.walkKeys(data)
  //   let re = {}
  //   for(let k of keys) {
  //     let val = _.get(src, k)
  //     _.set(re, k, val)
  //   }
  //   return re
  // },
  /***
   * Gen the keys deeply like `["a.b.c", "x.y.z"]` from a object
   */
  // walkKeys(input={}, predicate=()=>true) {
  //   let keys = []
  //   TiUtil.walk(input, (val, path)=>{
  //     keys.push(path)
  //   })
  //   return keys
  // },
  /***
   * Gen new Array to update the given element
   * 
   * @param list{Array} - the source Array
   * @param ele{Object} - Object to update
   * @param iteratee{Function} - match by two arguments:
   *  `function(item, ele)`, it undefined returned, the item wil be removed
   * if array returned, it will join the return array
   * @return the new Array instance
   */
  inset(list=[], iteratee=_.identity) {
    let list2 = []
    for(let li of list) {
      let li2 = iteratee(li)
      // Multi values returned
      if(_.isArray(li2) && !_.isEmpty(li2)) {
        for(let li22 of li2){
          list2.push(li22)
        }
      }
      // value returned
      if(!_.isUndefined(li2)){
        list2.push(li2)
      }
    }
    return list2
  },
  /***
   * Explain obj to a new one
   * 
   * The key `...` in obj will `_.assign` the value
   * The value `=xxxx` in obj will get the value from context
   */
  explainObj(context={}, obj, {
    evalFunc = false,
    iteratee = _.identity
  }={}) {
    //......................................
    const ExplainValue = (anyValue)=>{
      let theValue = anyValue
      //....................................
      // String : Check the "@BLOCK(xxx)" 
      if(_.isString(theValue)) {
        // Escape
        let m = /^:(:*(=|==|!=|=>>?|->)(.+))$/.exec(theValue)
        if(m) {
          return iteratee(m[1])
        }

        let m_type, m_val, m_dft;
        // Match template
        m = /^(==|!=|=>>?|->)(.+)$/.exec(theValue)
        if(m) {
          m_type = m[1]
          m_val  = _.trim(m[2])
        }
        // Find key in context
        else {
          m = /^(=)([^?]+)(\?(.*))?$/.exec(theValue)
          if(m) {
            m_type = m[1]
            m_val  = _.trim(m[2])
            m_dft  = m[4]
          }
        }
        // Matched
        if(m_type) {
          if(!Ti.Util.isNil(m_dft)) {
            m_dft = _.trim(m_dft)
          }
          //................................
          let fn = ({
            // ==xxx  # Get Boolean value now
            "==" : (val)=> {
              return _.get(context, val) ? true : false
            },
            // !=xxx  # Revert Boolean value now
            "!=" : (val)=> {
              return _.get(context, val) ? false : true
            },
            // =xxx   # Get Value Now
            "=" : (val, dft)=>{
              if(".." == val) {
                return context
              }
              let re = Ti.Util.getOrPick(context, val)
              if(Ti.Util.isNil(re) && !_.isUndefined(dft)){
                return dft
              }
              return re
            },
            // =>Ti.Types.toStr(meta)
            "=>>" : (val) => {
              let fn = Ti.Util.genInvoking(val, {context, partial: "right"})
              return fn()
            },
            // =>Ti.Types.toStr(meta)
            "=>" : (val) => {
              let fn = Ti.Util.genInvoking(val, {context, partial: "left"})
              return fn()
            },
            // Render template
            "->" : (val)=>{
              let m2 = /^(([\w\d_.]+)\?\?)?(.+)$/.exec(val)
              let test = m2[2]
              let tmpl = m2[3]
              if(test) {
                if(Ti.Util.isNil(_.get(context, test))) {
                  return
                }
              }
              return Ti.S.renderBy(tmpl, context)
            },
            // :=xxx  # Get Value Later
            // ":=" : (val, dft)=>{
            //   return (c2)=>{return _.get(c2, val)}
            // },
            // ->xxx  # Eval Template Result Now
            // :->xxx # Eval Template Result Later
            // ":->" : (val)=>{
            //   let tmpl = Ti.S.renderBy(val, context)
            //   return (c2)=>{return Ti.S.renderBy(tmpl, c2)}
            // },
          })[m_type]
          //................................
          // Check Function
          if(_.isFunction(fn)) {
            return fn(m_val, m_dft)
          }
          //................................
          // Warn it
          throw "invalid dynamic value: " + theValue
        }
        // Simple String
        return iteratee(theValue)
      }
      //....................................
      // Function  
      else if(_.isFunction(theValue)) {
        if(evalFunc) {
          let re = theValue(context)
          return iteratee(re)
        }
        return theValue
      }
      //....................................
      // Array 
      else if(_.isArray(theValue)) {
        let list = []
        for(let li of theValue) {
          let v2 = ExplainValue(li)
          list.push(iteratee(v2))
        }
        return list
      }
      //....................................
      // Object
      else if(_.isPlainObject(theValue)) {
        let o2 = {}
        _.forEach(theValue, (v2, k2)=>{
          let v3 = ExplainValue(v2)
          let v4 = iteratee(v3)
          // key `...` -> assign o1
          if("..." == k2) {
            _.assign(o2, v4)
          }
          // escape the "..."
          else if(/^\.{3,}$/.test(k2)) {
            o2[k2.substring(1)] = v4
          }
          // set value
          else {
            o2[k2] = v4
          }
        })
        return o2
      }
      //....................................
      // Others return directly
      return iteratee(anyValue)
    }
    //......................................
    // ^---- const ExplainValue = (anyValue)=>{
    //......................................
    return ExplainValue(obj)
  },
  /***
   * Call explainObj for each element if input is Array
   */
  explainObjs(context=[], obj={}, options) {
    if(_.isArray(context)){
      let re = []
      for(let li of context) {
        let it = TiUtil.explainObj(li, obj, options)
        re.push(it)
      }
      return re
    }
    // Take input as normal POJO
    return TiUtil.explainObj(context, obj, options)
  },
  /***
   * Create a function to return a given object's copy.
   * It just return the simple object like (`Number|String|Boolean`) directly,
   * and deep clone complex object like `Object|Array|Date|RegExp`
   * 
   * @param obj{Object|Array} : The obj pattern to be generated.
   * 
   * @return `Function`, nil arguments and return the new copy of given object.
   */
  genObj(obj={}) {
    return  _.partial(_.cloneDeep, obj)
  },
  /***
   * Group a batch of functions as one function.
   * 
   * @param fns{Array} : Functions to be grouped
   * 
   * @return `Function` grouping the passed on function list
   */
  groupCall(...fns) {
    const list = _.flattenDeep(fns)
                    .filter(fn=>_.isFunction(fn))
    // Nothing
    if(list.length == 0) {
      return undefined
    }
    // Only One
    if(list.length == 1) {
      return list[0]
    }
    return function(...args) {
      for(let fn of list) {
        fn.apply(this, args)
      }
    }
  },
  pushValue(obj, key, val, rawSet=false) {
    let old = _.get(obj, key) || []
    if(rawSet) {
      obj[key] = _.concat(old, val||[])
    } else {
      _.set(obj, key, _.concat(old, val||[]))
    }
  },
  pushValueBefore(obj, key, val, rawSet=false) {
    let old = _.get(obj, key) || []
    if(rawSet) {
      obj[key] = _.concat(val||[], old)
    } else {
      _.set(obj, key, _.concat(val||[], old))
    }
  },
  pushUniqValue(obj, key, val, rawSet=false) {
    let old = _.get(obj, key) || []
    if(rawSet) {
      obj[key] = _.uniq(_.concat(old, val||[]))
    } else {
      _.set(obj, key, _.uniq(_.concat(old, val||[])))
    }
  },
  pushUniqValueBefore(obj, key, val, rawSet=false) {
    let old = _.get(obj, key) || []
    if(rawSet) {
      obj[key] = _.uniq(_.concat(val||[], old))
    } else {
      _.set(obj, key, _.uniq(_.concat(val||[], old)))
    }
  },
  /***
   * Set value to obj[key] if only val is not undefined
   * If value is null, use the `dft`
   * 
   * @TODO zozoh: I think this function will cause many `Hard Reading Code`, 
   * should remove it
   */
  setTo(obj={}, key, val, dft) {
    // String mode
    if(_.isString(key) && !_.isUndefined(val)) {
      obj[key] = _.isNull(val) ? dft : val
    }
    // Object mode
    else if(_.isPlainObject(key)) {
      dft = val
      _.forOwn(key, (v, k)=>{
        if(!_.isUndefined(v)) {
          obj[k] = _.isNull(v) ? dft : v
        }
      })
    }
  },
  /***
   * Get item from list by index scroll to begin:
   * 
   * @param list{Array} - source list
   * @param index{Number} - index
   *  - `<0` backword
   *  - `>=0` forword
   * 
   * @return item
   */
  nth(list=[], index=0, dft=null) {
    let len = list.length
    if(len <= 0)
      return dft
    
    let x = Ti.Num.scrollIndex(index, len)

    return list[x]
  },
  /***
   * Gen unique key for any input object
   * 
   * @param obj {Any} - input object
   * @param prefix{String} - key prefix
   * @param sep {String} - key separetor
   * 
   * @return unique key for input object
   */
  anyKey(obj, prefix, sep="-") {
    // Guard
    if(TiUtil.isNil(obj)) {
      return obj
    }
    // Prefix
    let ks = []
    if(prefix){
      ks.push(prefix)
    }
    // Object of Array, join values
    if(_.isArray(obj) || _.isPlainObject(obj)){
      _.forEach(obj, v=>ks.push(v))
      return ks.join("-")
    }
    // Others to string
    else {
      ks.push(obj)
    }
    return ks.join(sep)
  },
  /***
   * Create new Mapping value
   * 
   * @param source{Object|Array} - Source to apply mapping
   * @param mapping{Object} - Mapping
   * @param customizer{Function} - Customized with params
   *                `(result, index, source)`
   *                only when source is `Array`
   * 
   * @return `Object|Array`
   */
  translate(source={}, mapping={}, customizer=_.identity) {
    if(_.isEmpty(source) || _.isEmpty(mapping)) {
      return _.cloneDeep(source)
    }
    // Array
    if(_.isArray(source)) {
      let list = []
      for(let i=0; i<source.length; i++) {
        let it = source[i]
        let result = TiUtil.translate(it, mapping, customizer)
        list.push(result)
      }
      return list
    }
    // Mapping String like:
    // "A=a;B=2;"
    if(_.isString(mapping)) {
      let ss = mapping.split(/[:;]/g)
      let map = {}
      for(let s of ss) {
        s = _.trim(s)
        let m = /^([^=]+)=(.+)$/.exec(s)
        if(m) {
          map[m[1]] = m[2]
        }
      }
      mapping = map
    }
    // If source is string, just get the value
    if(_.isString(source)) {
      return _.get(mapping, source)
    }
    // Take as plain object
    let re = {}
    _.forEach(mapping, (val, key)=>{
      let v2;
      // Whole Context
      if(".." == val) {
        v2 = source
      }
      // Get the value
      else {
        v2 = TiUtil.getOrPick(source, val)
      }
      // Customized and join
      v2 = customizer(v2)
      _.set(re, key, v2)
    })
    // Done
    return re
  },
  /***
   * Clone and omit all function fields
   */
  pureCloneDeep(obj) {
    // Array to recur
    if(_.isArray(obj)){
      let re = []
      _.forEach(obj, (v, i)=>{
        if(!_.isUndefined(v) && !_.isFunction(v)){
          re[i] = TiUtil.pureCloneDeep(v)
        }
      })
      return re
    }
    // Object to omit the function
    if(_.isPlainObject(obj)) {
      let re = {}
      _.forEach(obj, (v, k)=>{
        if(!_.isUndefined(v) && !_.isFunction(v)){
          re[k] = TiUtil.pureCloneDeep(v)
        }
      })
      return re
    }
    // Just clone it
    return _.cloneDeep(obj)
  },
  /***
   * Replace one object property key. Only for plaint object.
   * 
   * @param source{Object|Array} - Source to apply mapping
   * @param path{String} - dot splited path like "a.2.name"
   * @param newKey{String}
   * 
   * @return new Object or array
   */
  setKey(source={}, path, newKey) {
    // Define the iteratee
    const set_key_by = function(src, keys=[], offset=0, newKey) {
      // Guard it
      if(offset >= keys.length) {
        return src
      }
      //.....................................
      // For Array : call-down
      if(_.isArray(src)) {
        let list = []
        let theIndex = parseInt(keys[offset])
        for(let i=0; i<src.length; i++) {
          // call-down
          if(i == theIndex) {
            let val = set_key_by(src[i], keys, offset+1, newKey)
            list.push(val)
          }
          // Just copy it
          else {
            list.push(src[i])
          }
        }
        return list
      }
      //.....................................
      // For Object
      if(_.isPlainObject(src)) {
        let reo = {}
        let srcKeys = _.keys(src)
        // Find the replace key
        if(keys.length == (offset+1)) {
          let theKey = keys[offset]
          for(let key of srcKeys) {
            let val = src[key]
            // Now replace it
            if(theKey == key) {
              reo[newKey] = val
            }
            // Just copy it
            else {
              reo[key] = val
            }
          }
        }
        // Call-down
        else {
          for(let key of srcKeys) {
            let val = src[key]
            let v2 = set_key_by(val, keys, offset+1, newKey)
            reo[key] = v2
          }
        }
        return reo
      }
      //.....................................
      // just return
      return src;
    }
    // Call in
    if(_.isString(path)) {
      path = path.split(".")
    }
    return set_key_by(source, path, 0, newKey)
  },
  /***
   * Get value from obj
   * 
   * @param key{String|Array} value key, if array will pick out a new obj
   * 
   * @return new obj or value
   */
  getOrPick(obj, key, dft) {
    // Array to pick
    if(_.isArray(key)) {
      return Ti.Util.fallback(_.pick(obj, key), dft)
    }
    // Function to eval
    if(_.isFunction(key)) {
      return Ti.Util.fallback(key(obj), dft)
    }
    // String
    if(_.isString(key)) {
      // get multi candicate
      let keys = key.split("|")
      if(keys.length > 1) {
        return Ti.Util.fallback(Ti.Util.getFallbackNil(obj, keys), dft)
      }
    }
    // Get by path
    return Ti.Util.fallback(_.get(obj, key), dft)
  },
  /***
   * Get value from obj
   * 
   * @param key{String|Array} value key, if array will pick out a new obj
   * 
   * @return new obj or value
   */
  getOrPickNoBlank(obj, key, dft) {
    // Array to pick
    if(_.isArray(key)) {
      return Ti.Util.fallback(_.pick(obj, key), dft)
    }
    // Function to eval
    if(_.isFunction(key)) {
      return Ti.Util.fallback(key(obj), dft)
    }
    // String
    if(_.isString(key)) {
      // get multi candicate
      let keys = key.split("|")
      if(keys.length > 1) {
        return Ti.Util.fallback(Ti.Util.getFallbackBlank(obj, keys), dft)
      }
    }
    // Get by path
    return Ti.Util.fallback(_.get(obj, key), dft)
  },
  /***
   * @param obj{Object}
   */
  truthyKeys(obj={}) {
    let keys = []
    _.forEach(obj, (v, k)=>{
      if(v) {
        keys.push(k)
      }
    })
    return keys
  },
  /***
   * @param obj{Object}
   * @param sep{String}
   * 
   * @return String seperated by given seperator
   */
  joinTruthyKeys(obj={}, sep=",") {
    let keys = TiUtil.truthyKeys(obj)
    return keys.join(sep)
  },
  /***
   * Get value from object fallbackly
   * 
   * @param obj{Object} - source object
   * @param keys{Array} - candicate keys
   * 
   * @return `undefined` if not found
   */
  getFallback(obj, ...keys) {
    let ks = _.flattenDeep(keys)
    for(let k of ks) {
      if(k) {
        let v = _.get(obj, k)
        if(!_.isUndefined(v))
          return v
      }
    }
  },
  getFallbackNil(obj, ...keys) {
    let ks = _.flattenDeep(keys)
    for(let k of ks) {
      if(k) {
        let v = _.get(obj, k)
        if(!TiUtil.isNil(v))
          return v
      }
    }
  },
  getFallbackEmpty(obj, ...keys) {
    let ks = _.flattenDeep(keys)
    for(let k of ks) {
      if(k) {
        let v = _.get(obj, k)
        if(!_.isEmpty(v))
          return v
      }
    }
  },
  getFallbackBlank(obj, ...keys) {
    let ks = _.flattenDeep(keys)
    for(let k of ks) {
      if(k) {
        let v = _.get(obj, k)
        if(!Ti.Util.isBlank(v))
          return v
      }
    }
  },
  getFallbackNaN(obj, ...keys) {
    let ks = _.flattenDeep(keys)
    for(let k of ks) {
      if(k) {
        let v = _.get(obj, k)
        if(!isNaN(v))
          return v
      }
    }
  },
  /***
   * Fallback a group value
   * 
   * @return The first one which is not undefined
   */
  fallback(...args) {
    for(let arg of args) {
      if(!_.isUndefined(arg))
        return arg
    }
  },
  fallbackNil(...args) {
    for(let arg of args) {
      if(!TiUtil.isNil(arg))
        return arg
    }
  },
  fallbackEmpty(...args) {
    for(let arg of args) {
      if(!_.isEmpty(arg))
        return arg
    }
  },
  fallbackBlank(...args) {
    for(let arg of args) {
      if(!Ti.S.isBlank(arg))
        return arg
    }
  },
  fallbackNaN(...args) {
    for(let arg of args) {
      if(!isNaN(arg))
        return arg
    }
  },
  /***
   * Test given input is `null` or `undefined`
   * 
   * @param o{Any} - any input value
   * 
   * @return `true` or `false`
   */
  isNil(o) {
    return _.isUndefined(o) || _.isNull(o)
  },
  isBlank(o) {
    return _.isUndefined(o)
          || _.isNull(o)
          || "" === o
          || /^[ \t]*$/.test(o)
  },
  /***
   * Get or set one object value.
   * Unlike the `geset`, the param `key` is expected as `String`.
   * If it is `Object`, it will batch set values by `Object` key-value pairs.
   * 
   * @param obj{Object} - The target object, which get from or set to.
   * @param key{String|Object|Array} - The value key or pairs to set to `obj`.
   *     If `array`, it will pick and return a group of key-values from target object 
   * @param val{Any} - When key is not `Object`, it will take the param as value
   *     to set to target object. If it is `undefined`, it will get value from 
   *     target object
   * 
   * @return the value when play as `getter`, and `obj` self when play as `setter`
   */
  geset(obj={}, key, val) {
    // Set by pairs
    if(_.isPlainObject(key)) {
      _.assign(obj, key)
      return obj
    }
    // Pick mode
    else if(_.isArray(key)) {
      return _.pick(obj, key)
    }
    // Set the value
    else if(!_.isUndefined(val)){
      obj[key] = val
      return obj
    }
    // Return self
    else if(_.isUndefined(key)) {
      return obj
    }
    // As general getter
    return obj[key]
  },
  /***
   * Invoke function in Object or Map
   */
  async invoke(fnSet={}, name, args=[], context=this) {
    let fn = _.get(fnSet, name)
    if(_.isFunction(fn)) {
      let as = _.concat(args)
      await fn.apply(context, as)
    }
  },
  /***
   * @return Get first element if input is array, or input self
   */
  first(input=[]) {
    if(_.isArray(input))
      return _.first(input)
    return input
  },
  /***
   * @return Get last element if input is array, or input self
   */
  last(input=[]) {
    if(_.isArray(input))
      return _.last(input)
    return input
  },
  /***
   * @param key{Function|String|Array}
   * @param dftKeys{Array}: if key without defined, use the default keys to pick
   * @param indexPrefix{String}: for Index Mode, just like `Row-`
   * 
   * @return Function to pick value
   */
  genGetter(key, {
    indexPrefix,
    dftKeys=[],
    context={},
    funcSet = window,
    partial = "right"  // "left" | "right" | Falsy
  }={}) {
    //.............................................
    // Customized Function
    if(_.isFunction(key)) {
      return it => key(it)
    }
    //.............................................
    // String || Array
    if(key) {
      //...........................................
      // Index Mode: for `Row-0`, ti-table getRowId
      if(indexPrefix) {
        return (it, index)=>{
          return Ti.Util.fallbackNil(
            Ti.Types.toStr(_.get(it, key)), 
            `${indexPrefix}${index}`
          )
        }
      }
      //...........................................
      // Static value
      let m = /^'(.+)'$/.exec(key)
      if(m) {
        return ()=>m[1]
      }
      //...........................................
      // Invoke mode
      m = /^=>(.+)$/.exec(key)
      if(m) {
        let invoke = m[1]
        return TiUtil.genInvoking(invoke, {
          context, funcSet, partial
        })
      }
      //...........................................
      // Default Mode
      return it => Ti.Util.getOrPick(it, key)
    }
    //.............................................
    // Default Keys
    if(!_.isEmpty(dftKeys)) {
      return it => Ti.Util.getFallback(it, ...dftKeys)
    }
    //.............................................
  },
  /***
   * "Ti.Types.toStr(abc)" -> Function
   * 
   * {name:"xxx", args:[..]} -> Function
   */
  genInvoking(str, {
    context={},
    funcSet = window,
    partial = "left"  // "left" | "right" | Falsy
  }={}) {
    //.............................................
    if(_.isFunction(str)) {
      return str
    }
    //.............................................
    let callPath, callArgs;
    // Object mode
    if(str.name && !_.isUndefined(str.args)) {
      callPath = str.name
      callArgs = _.concat(str.args)
    }
    // String mode
    else {
      let m = /^([^()]+)(\((.+)\))?$/.exec(str)
      if(m) {
        callPath = _.trim(m[1])
        callArgs = _.trim(m[3])
      }
    }
    //.............................................
    //console.log(callPath, callArgs)
    let func = _.get(funcSet, callPath)
    if(_.isFunction(func)) {
      let args = Ti.S.joinArgs(callArgs, [], v=>{
        return Ti.S.toJsValue(v, {context})
      })
      if(!_.isEmpty(args)) {
        // [ ? --> ... ]
        if("right" == partial) {
          return  function(input){
            let as = _.isUndefined(input)
                      ? args
                      : _.concat([input], args);
            return func.apply(this, as)
          }
        }
        // [ ... <-- ?]
        else if("left" == partial) {
          return  function(input){
            let as = _.concat(args, [input])
            return func.apply(this, as)
          }
        }
        // [..]
        return ()=>func(...args)
      }
      return func
    }

    // Not invokeing, just return str self
    return ()=>str
  },
  /***
   * @param matchBy{Function|String|Array}
   * @param partially {Boolean} 
   * 
   * @return Function to match value
   */
  genItemMatcher(matchBy, partially=false) {
    if(_.isFunction(matchBy)) {
      return (it, str)=>matchBy(it, str)
    }
    if(_.isString(matchBy)) {
      return partially
        ? (it, str)=>_.indexOf(Ti.Util.getOrPick(it, matchBy), str)>=0
        : (it, str)=>_.isEqual(Ti.Util.getOrPick(it, matchBy), str)
    }
    if(_.isArray(matchBy)) {
      return (it, str)=>{
        for(let k of matchBy) {
          let v = Ti.Util.getOrPick(it, k)
          if(partially) {
            if(_.indexOf(v, str)>=0)
              return true
          }
          else {
            if(_.isEqual(v, str))
              return true
          }
        }
        return false
      }
    }
    return (it, str)=>false
  },
  /***
   * @param valueBy{Function|String|Array}
   * 
   * @return Function to pick value
   */
  genItemValueGetter(valueBy, dftVal) {
    if(_.isFunction(valueBy)) {
      return it => valueBy(it, dftVal)
    }
    if(_.isString(valueBy)) {
      return it => Ti.Util.getOrPick(it, valueBy, dftVal)
    }
    return function(){return dftVal;}
  },
  /***
   * @return Function to get row Id
   */
  genRowIdGetter(idBy, dftKeys=["id", "value"]) {
    if(_.isFunction(idBy)) {
      return (it, index) => Ti.Types.toStr(idBy(it, index))
    }
    if(_.isString(idBy)) {
      return (it, index)=>{
        return Ti.Util.fallbackNil(
          Ti.Types.toStr(_.get(it, idBy)), `Row-${index}`)
      }
    }
    if(!_.isEmpty(dftKeys)) {
      return it => Ti.Util.getFallback(it, ...dftKeys)
    }
  },
  /***
   * @return Function to get row data
   */
  genRowDataGetter(rawDataBy) {
    if(_.isFunction(rawDataBy)) {
      return it => rawDataBy(it)
    }
    if(_.isString(rawDataBy)) {
      return it => _.get(it, rawDataBy)
    }
    if(_.isObject(rawDataBy)) {
      return it => Ti.Util.translate(it, rawDataBy)
    }
    return it => it
  }
}
//-----------------------------------
export const Util = TiUtil
