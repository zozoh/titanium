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
function normlizeFormField(vm, fld, nbs=[]) {
  let f2;
  // For group
  if('Group' == fld.type) {
    f2 = {
      type  : "Group",
      icon  : fld.icon,
      title : fld.title,
      fields : []
    }
    // Recur ...
    for(let i=0; i<fld.fields.length; i++) {
      let subFld = fld.fields[i]
      let sub2 = normlizeFormField(vm, subFld, [...nbs, i])
      f2.fields.push(sub2)
    }
  }
  // Normal field
  else {
    f2 = _.cloneDeep(fld)
    f2.type = f2.type || "String"

    // Tidy form function
    f2.serializer  = formFunc(vm.config, f2, "serializer")
    f2.transformer = formFunc(vm.config, f2, "transformer")
  }
  // field key
  f2.key = fld.name 
            ? [].concat(fld.name).join("-")
            : "ti-fld-" + nbs.join("-")
  // return it
  return f2
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
    formClass() {
      let spacing = this.config.spacing || "comfy"
      return "as-spacing-" + spacing
    },
    //.......................................
    fieldList() {
      let list = []
      if(_.isArray(this.config.fields)) {
        for(let i=0; i<this.config.fields.length; i++) {
          let fld = normlizeFormField(this, this.config.fields[i], [i])
          list.push(fld)
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
  },
  //////////////////////////////////////////////////////
  updated : function() {
    // Find all field-name Elements
    let $fldNames = Ti.Dom.findAll(".form-field > .field-name", this.$el)

    // Reset them to org-width
    for(let $fldnm of $fldNames) {
      Ti.Dom.setStyle($fldnm, {width:""})
    }

    // Get the max-width of them
    let maxWidth = 0
    for(let $fldnm of $fldNames) {
      let rect = Ti.Rects.createBy($fldnm)
      maxWidth = Math.ceil(Math.max(rect.width, maxWidth))
    }

    // Wait for whole view rendered, and align the field-name
    this.$nextTick(()=>{
      for(let $fldnm of $fldNames) {
        Ti.Dom.setStyle($fldnm, {width:maxWidth})
      }
    })
  }
}