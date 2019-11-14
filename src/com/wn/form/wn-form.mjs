function _VARS(val) {
  if(_.isNull(val) || _.isUndefined(val)){
    return {val:""}
  }
  if(_.isString(val)) {
    return {val:val.replace(/'/g, "")}
  }
  if(_.isNumber(val)){
    return {val}
  }
  if(_.isDate(val)){
    return {val:Ti.Types.formatDate(val)}
  }
  if(_.isArray(val) || _.isPlainObject(val)){
    return val
  }
  return {val: "" + val}
}
//----------------------------------------------
function gen_wn_sys_exec(vm, fn, args){
  let cmdText, options
  // args like [$cmdText, {..options..}]
  if(_.isArray(args)) {
    cmdText = _.get(args, 0)
    options = _.get(args, 1) || {as:"json"}
  }
  // The args is just normalze string
  else {
    cmdText = args
    options = {as:"json"}
  }
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
    let vars = _VARS(val)
    let cmd = cmdTmpl(vars)
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
  },
  "Wn.Io.find" : function(vm, args){
    return async function() {
      return await Wn.Io.find(...args)
    }
  },
  "Wn.Io.findList" : function(vm, args){
    return async function() {
      return await Wn.Io.findList(...args)
    }
  },
  "Wn.Io.findInBy" : function(vm, args){
    return async function(val) {
      return await Wn.Io.findInBy(val, ...args)
    }
  },
  "Wn.Io.findListInBy" : function(vm, args){
    return async function(val) {
      return await Wn.Io.findListInBy(val, ...args)
    }
  },
  "Wn.Dict.getAll" : function(vm, args){
    return async function(){
      return await Wn.Dict.getAll(...args)
    }
  },
  "Wn.Dict.get" : function(vm, args){
    return async function(val){
      return await Wn.Dict.get(...args, val)
    }
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
    "icon" : {
      type : String,
      default : null
    },
    "title" : {
      type : String,
      default : null
    },
    "className" : {
      type : String,
      default : null
    },
    "display" : {
      type : String,
      default : "all"
    },
    "currentTab" : {
      type : Number,
      default : 0
    },
    "config" : {
      type : Object,
      default : null
    },
    "data" : {
      type : Object,
      default : null
    },
    // "status" : {
    //   type : Object,
    //   default : null
    // },
    "fieldStatus" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////////////////
  computed : {
    formedConfig() {
      return formatObj(this, this.config);
    },
    hasData() {
      return !_.isEmpty(this.data)
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