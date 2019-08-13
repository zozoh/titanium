//////////////////////////////////////////////////
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
    f2.serializer  = Ti.Types.getFuncBy(f2, "serializer", vm.fnSet)
    f2.transformer = Ti.Types.getFuncBy(f2, "transformer", vm.fnSet)
  }
  // field key
  f2.key = fld.name 
            ? [].concat(fld.name).join("-")
            : "ti-fld-" + nbs.join("-")
  // return it
  return f2
}
//////////////////////////////////////////////////
const resize = function(evt){
  this.__debounce_adjust_fields_width()
}
//////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  //////////////////////////////////////////////////////
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
    //.......................................
    hasHeader() {
      return this.title || this.icon ? true : false
    },
    //.......................................
    formClass() {
      let spacing = this.config.spacing || "comfy"
      let klass = ["as-spacing-" + spacing]
      if(this.className) {
        klass.push(this.className)
      }
      return klass
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
    /***
     * Eval function set for `transformer|serializer` of each fields
     * 
     * Defaultly, it will support the function set defined in `Ti.Types`
     */
    fnSet() {
      return _.assign({}, Ti.Types, this.config.extendFunctionSet)
    },
    //.......................................
    formData() {
      return this.data || {}
    }
    //.......................................
  },
  //////////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    onChanged(payload) {
      //console.log("changed", payload)
      this.$emit("changed", payload)
    },
    //----------------------------------------------
    onInvalid(payload) {
      //console.log("invalid", payload)
      this.$emit("invalid", payload)
    },
    //----------------------------------------------
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
    //----------------------------------------------
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