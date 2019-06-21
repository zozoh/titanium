//-----------------------------------------
// fnType : "transformer|serializer"
function formFunc(fnSet={}, fld, fnType){
  // console.log("formFunc:")
  // console.log(" --", fnSet)
  // console.log(" --", fld)
  // console.log(" --", fnType)
  // Try to ge the function
  let fn = fld[fnType]
  // Get the `func` by field type as default
  if(!fn) {
    return Ti.Types.$FN(fld.type, fnType)
  }
    
  // Function already
  if(_.isFunction(fn))
    return fn
  // Is string
  if(_.isString(fn)) {
    return _.get(fnSet, [fnType, fn])
  }
  // Plain Object 
  if(_.isPlainObject(fn) && fn.name) {
    //console.log(fnType, fnName)
    let fn2 = _.get(fnSet, [fnType, fn.name])
    if(!_.isFunction(fn2))
      return
    // Partical args ...
    if(_.isArray(fn.args) && fn.args.length > 0) {
      return _.partialRight(fn2, ...fn.args)
    }
    // Partical one arg
    if(!_.isUndefined(fn.args) && !_.isNull(fn.args)) {
      return _.partialRight(fn2, fn.args)
    }
    // Just return
    return fn2
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

    // field status
    let fstKey = [].concat(f2.name).join("-")
    let fst = vm.fieldStatus[fstKey]
    if(fst) {
      f2.status  = fst.status
      f2.message = fst.message
    }

    // Tidy form function
    f2.serializer  = formFunc(vm.fnSet, f2, "serializer")
    f2.transformer = formFunc(vm.fnSet, f2, "transformer")
  }
  // field key
  f2.key = fld.name 
            ? [].concat(fld.name).join("-")
            : "ti-fld-" + nbs.join("-")
  // return it
  return f2
}
//-----------------------------------------
const resize = function(evt){
  this.__debounce_adjust_fields_width()
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
    },
    "fieldStatus" : {
      type : Object,
      default : ()=>({})
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
    fnSet() {
      return {
        serializer  : this.getFunctionSet("serializers"),
        transformer : this.getFunctionSet("transformers")
      }
    },
    //.......................................
    formData() {
      return this.data || {}
    }
    //.......................................
  },
  //////////////////////////////////////////////////////
  methods : {
    // Get the function set for `transformer|serializer`
    // add the default mapping functions
    getFunctionSet(fnSetName) {
      let fnSet = this.config[fnSetName]
      return _.assign({}, fnSet, {
        // format obj to string
        formatStringBy(obj={}, fmt=""){
          return Ti.S.renderVars(fmt, obj)
        },
        // Mapping obj to another
        mappingBy(obj={}, mapping={}) {
          return Ti.Util.mapping(obj, mapping)
        }
      })
    },
    onChanged(payload) {
      //console.log("changed", payload)
      this.$emit("changed", payload)
    },
    onInvalid(payload) {
      //console.log("invalid", payload)
      this.$emit("invalid", payload)
    },
    __adjust_fields_width() {
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
      for(let $fldnm of $fldNames) {
        Ti.Dom.setStyle($fldnm, {width:maxWidth})
      }
    }
  },
  //////////////////////////////////////////////////////
  watch : {
    "config.fields" : function(){
      this.$nextTick(()=>{
        this.__adjust_fields_width()
      })
    }
  },
  //////////////////////////////////////////////////////
  created : function() {
    this.__debounce_adjust_fields_width = _.debounce(()=>{
      this.__adjust_fields_width()
    }, 500)
  },
  mounted : function() {
    Ti.Viewport.watch(this, {resize})
    this.$nextTick(()=>{
      this.__adjust_fields_width()
    })
  },
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////////////////
}