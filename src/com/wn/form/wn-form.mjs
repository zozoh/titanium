function _STR(val) {
  if(_.isNull(val) || _.isUndefined(val) || _.isString(val)){
    return val
  }
  if(_.isNumber(val)){
    return ""+val
  }
  if(_.isDate(val)){
    return Ti.Types.formatDate(val)
  }
  if(_.isArray(val) || _.isPlainObject(val)){
    return JSON.stringify(val) 
  }
  return "" + val
}
//----------------------------------------------
function gen_wn_sys_exec(vm, fn, args){
  let cmdText = _.get(args, 0)
  let options = _.get(args, 1) || {as:"json"}
  if(!cmdText)
    return
  
  /**
   * ES template style template:
   * ```
   * obj -match 'nm:"${value}"' -l -json
   * ``` 
   * Use `${value}` to place the `interpolate`
   */
  const cmdTmpl =  _.template(cmdText);
  return async function(val) {
    let str = _STR(val).replace(/'/g, "")
    let cmd = cmdTmpl({value:str})
    return await fn.apply(vm, [cmd, options])
  }
}
//----------------------------------------------
const METHODS = {
  "Wn.Sys.exec" : function(vm, args){
    return gen_wn_sys_exec(vm, Wn.Sys.exec, args)
  },
  "Wn.Sys.exec2" : function(vm, args){
    return gen_wn_sys_exec(vm, Wn.Sys.exec2, args)
  }
}
//----------------------------------------------
function formatObj(vm, obj) {
  // Plain Object
  if(_.isPlainObject(obj)) {
    // Function call
    if(obj.method) {
      let method = METHODS[obj.method]
      if(_.isFunction(method)) {
        return method(this, obj.args)
      }
    }
    // General object
    let re = {}
    _.forEach(obj, (val, key)=>{
      let v2  = formatObj(vm, val)
      re[key] = v2
    })
    return re
  }
  // Array
  else if(_.isArray(obj)){
    let list = []
    for(let it of obj) {
      let fit = formatObj(vm, it)
      list.push(fit)
    }
    return list
  }
  // Others
  return obj
}
//----------------------------------------------
export default {
  props : {
    "config" : {
      type : Object,
      default : null
    },
    "data" : {
      type : Object,
      default : null
    },
    "status" : {
      type : Object,
      default : null
    }
  },
  //////////////////////////////////////////////////////
  computed : {
    formedConfig() {
      return formatObj(this, this.config);
    }
  },
  //////////////////////////////////////////////////////
  methods : {
    onChanged(payload) {
      this.$emit("changed", payload)
    },
    onInvalid(payload) {
      this.$emit("invalid", payload)
    }
  }
}