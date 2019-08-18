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
        _.assign(obj, val)
      }
      // Another types will be ignore
    }
    return obj
  },
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
  explainObj(context, obj, options={}) {
    // Default options
    let {
      fnSet=Ti.Types,
      iteratee = _.identity
    } = options
    //......................................
    let o1 = iteratee(obj)
    //......................................
    // Array
    if(_.isArray(o1)) {
      let list = []
      for(let val of o1) {
        list.push(TiUtil.explainObj(context, val, options))
      }
      return list
    }
    //......................................
    // Plain Object
    if(_.isPlainObject(o1)) {
      // Invoke function
      if(o1.__is_calling) {
        let fn = o1.name
        if(_.isString(fn)) {
          fn = _.get(fnSet, o1.name)
        }
        let args = []
        if(_.isArray(o1.args)) {
          for(let al of o1.args) {
            // Dynamic
            if(_.isFunction(al)) {
              let li = al(context)
              args.push(li)
            }
            // Static
            else {
              args.push(al)
            }
          }
        }
        // Do invoke
        return fn.apply(context, args)
      }
      // Bind Function
      else if(o1.__is_function) {
        let args = _.map(o1.args, (arg)=>{
          // :?=xxx   Get Value
          let re = Ti.S.explainDynamicString(arg, {
            context,
            whenEscape : (context, key)=>{
              return (c2)=>{
                return _.get(c2, key)
              }
            }
          })
          if(re.isDynamic) {
            return re.output
          }
          // :?-?xxx${xx}  Tmplate
          re = Ti.S.explainDynamicString(arg, {
            context,
            regex : /^(:?)->(.+)$/,
            whenGet : (context, key)=> {
              return Ti.S.renderBy(key, context)
            },
            whenEscape : (context, key)=>{
              let tmpl = Ti.S.renderBy(key, context)
              return (c2)=>{
                return Ti.S.renderBy(tmpl, c2)
              }
            }
          })
          if(re.isDynamic) {
            return re.output
          }
          // Normal
          return Ti.S.toJsValue(arg)
         })
        return {
          __is_calling : true,
          name : _.get(fnSet, o1.name),
          args
        }
      }
      // Call down
      else {
        let o2 = {}
        _.forEach(o1, (v2, k2)=>{
          let v3 = TiUtil.explainObj(context, v2, options)
          // key `...` -> assign o1
          if("..." == k2) {
            _.assign(o2, v3)
          }
          // set value
          else {
            o2[k2] = v3
          }
        })
        return o2
      }
    }
    //......................................
    // String: =xx.xx
    if(_.isString(o1)) {
      let {isDynamic, output} = Ti.S.explainDynamicString(o1, {context})
      if(isDynamic)
        return output
    }
    //......................................
    // Others
    return o1
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
  pushValue(obj, key, val) {
    let old = _.get(obj, key) || []
    _.set(obj, key, _.concat(old, val||[]))
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
  mapping(source={}, mapping={}, customizer=_.identity) {
    if(_.isEmpty(source) || _.isEmpty(mapping))
      return source
    // Array
    if(_.isArray(source)) {
      let re = []
      for(let i=0; i<source.length; i++) {
        let it = source[i]
        let result = TiUtil.mapping(it, mapping)
        let t2 = customizer(result, i, source)
        re.push(t2)
      }
      return re
    }
    // Take as plain object
    let re = {}
    _.forEach(mapping, (val, key)=>{
      re[key] = TiUtil.getFallback(source, val, key)
    })
    return re
  },
  /***
   * Get value from obj
   * 
   * @param key{String|Array} value key, if array will pick out a new obj
   * 
   * @return new obj or value
   */
  getOrPick(obj, key) {
    if(_.isArray(key)) {
      return _.pick(obj, key)
    }
    return _.get(obj, key)
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
      let v = obj[k]
      if(!_.isUndefined(v))
        return v
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
  }
}
//-----------------------------------
export default TiUtil
