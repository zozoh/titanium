//-----------------------------------------
// fnType : "transformer|serializer"
function formFunc(config={}, fld, fnType){
  let fnName = fld[fnType]
  // Get the `func` by field type
  if(!fnName) {
    fnName = Ti.Types.$FNAME(fld.type, fnType)
  }
  if(!fnName && 'validator'!=fnType) {
    throw Error("invalid ti-form field type: " + fld.type)
  }
    
  // Function already
  if(_.isFunction(fnName))
    return fnName
  // Is string
  if(_.isString(fnName)) {
    return Ti.Types.$FN(config, fnType, fnName)
  }
  // Plain Object 
  if(_.isPlainObject(fnName) && fnName.name) {
    //console.log(fnType, fnName)
    let fn = Ti.Types.$FN(config, fnType, fnName.name)
    if(!_.isFunction(fn))
      return
    // Partical args ...
    if(_.isArray(fnName.args) && fnName.args.length > 0) {
      return _.partialRight(fn, ...fnName.args)
    }
    // Partical one arg
    if(!_.isUndefined(fnName.args) && !_.isNull(fnName.args)) {
      return _.partialRight(fn, fnName.args)
    }
    // Just return
    return fn
  }
}
//-----------------------------------------
export default {
  //////////////////////////////////////////////////////
  props : {
    "config" : {
      type : Object,
      default : ()=>({})
    },
    "data" : {
      type : Object,
      default : ()=>({})
    },
    "status" : {
      type : Object,
      default : ()=>({
        "changed"   : false,
        "saving"    : false,
        "reloading" : false
      })
    }
  },
  //////////////////////////////////////////////////////
  computed : {
    fieldList() {
      console.log("fieldList")
      let list = []
      if(_.isArray(this.config.fields)) {
        for(let fld of this.config.fields) {
          let f2 = _.cloneDeep(fld)
          f2.type = f2.type || "String"

          // Tidi form function
          f2.serializer  = formFunc(this.config, f2, "serializer")
          f2.transformer = formFunc(this.config, f2, "transformer")
          //console.log(f2)

          // Add to list
          list.push(f2)
        }
      }
      return list
    },
    //.......................................
    formData() {
      return this.data || {}
    }
  },
  //////////////////////////////////////////////////////
  methods : {
    onChanged(payload) {
      //console.log("changed", payload)
      this.$emit("changed", payload)
    },
    onInvalid(payload) {
      //console.log("invalid", payload)
      this.$emit("invalid", payload)
    }
  }
}