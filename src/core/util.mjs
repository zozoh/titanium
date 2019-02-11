import {TiPaths} from "./util_paths.mjs"
//---------------------------------------
export const TiUtil = {
  ...TiPaths,
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
   * Create a function to return a given object's copy.
   * It just return the simple object like (`Number|String|Boolean`) directly,
   * and deep clone complex object like `Object|Array|Date|RegExp`
   * 
   * @param obj{Object|Array} : The obj pattern to be generated.
   * 
   * @return
   * `Function`, no arguments and return the new copy of given object each time be invoked.
   */
  genObj(obj={}) {
    return  _.partial(_.cloneDeep, obj)
  },
  /***
   * Group a batch of functions as one function.
   * 
   * @params
   * - fns{Array} : Functions to be grouped
   * @return
   * `Function` grouping the passed on function list
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
  }
}
//-----------------------------------
export default TiUtil
