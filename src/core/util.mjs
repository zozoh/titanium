export const TiUtil = {
  /***
  Merge an plain object by gived arguments deeply.

  @params
  - `obj{Object}` : the object to be merged with
  - `args{Array<Any>}` : the value that will be merged to `obj`
    For each argument passed on, here is the treatment:
    + `Object` : merge to the result by `_.assign`
    + `Function` : set to result, `name` as the key
    + `Array` : merget to `obj` recursively
    + Another simple object like *Boolean|String|Number...* will be ignore
  @return
  The `obj` which be passed on.
  */
  merge(obj={}, ...args){
    const list = _.flattenDeep(args)
    for(let arg of list) {
      if(!arg) {
        continue
      }
      // Array
      if(_.isArray(arg)) {
        TiUtil.merge(obj, ...arg)
      }
      // Function
      else if(_.isFunction(arg)) {
        obj[arg.name] = arg
      }
      // Plain Object
      else if(_.isPlainObject(arg)) {
        _.assign(obj, arg)
      }
      // Another types will be ignore
    }
    return obj
  },
  //---------------------------------------
  /***
  Create a function to return a given object's copy.
  It just return the simple object like (`Number|String|Boolean`) directly,
  and deep clone complex object like `Object|Array|Date|RegExp`
  @params
  - obj{Object|Array}
  @return
  `Function`, no arguments and return the new copy of given object each time invoked.
  */
  genObj(obj={}) {
    return  _.partial(_.cloneDeep, obj)
  },
  //---------------------------------------
  /***
  Group a batch of functions as one function.
  @params
  - fns{Array} : Functions to be grouped
  @return
  `Function` grouping the passed on function list
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
  //---------------------------------------
  pushValue(obj, key, val) {
    let old = _.get(obj, key) || []
    _.set(obj, key, _.concat(old, val||[]))
  }
}
//-----------------------------------
export default TiUtil
