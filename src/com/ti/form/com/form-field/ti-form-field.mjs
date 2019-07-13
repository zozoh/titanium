function BOOL(val) {
  return val ? true : false
}
function VAL(vm, val) {
  let v2 = val
  // apply default
  if(_.isUndefined(val) && !_.isUndefined(vm.undefinedAs)){
    v2 = _.cloneDeep(vm.undefinedAs)
  }
  if(_.isNull(val) && !_.isNull(vm.nullAs)){
    v2 = _.cloneDeep(vm.nullAs)
  }
  if(vm.isNumberType && isNaN(val)) {
    v2 = vm.nanAs
  }
  return v2
}
////////////////////////////////////////////////
export default {
  inheritAttrs: false,
  //////////////////////////////////////////////
  computed : {
    show() {
      let title   = !_.isNull(this.fieldTitle)
      let icon    = BOOL(this.icon)
      let message = BOOL(this.message)
      let status  = BOOL(this.status)
      let tip     = BOOL(this.tip)
      return {
        title, icon, message, status, tip,
        name : (title || icon)
      }
    },
    //.......................................  
    isNumberType() {
      return /^(Number|Integer)$/.test(this.type)
    },
    //.......................................  
    fieldTitle() {
      if(this.title)
        return this.title
      if(_.isArray(this.name))
        return this.name.join("-")
      return this.name
    },
    //.......................................
    fieldComClass() {
      if("auto" == this.width) {
        return "is-size-auto"
      }
      if("stretch" == this.width) {
        return "is-size-stretch"
      }
    },
    //.......................................
    fieldComStyle() {
      if(this.width && !/^(auto|stretch)$/.test(this.width)) {
        return Ti.Css.toStyle({
          width : this.width
        })
      }
    },
    //.......................................
    fieldValue() {
      return Ti.Util.getOrPick(this.data, this.name)
    },
    //.......................................
    componentType() {
      return this.comType
    },
    //.......................................
    componentOptions() {
      return this.comConf || {}
    },
    //.......................................
    componentValue() {
      if(!this.data){
        return undefined
      }
      let val = this.fieldValue

      // apply default
      let v2 = VAL(this, val)

      // Customized Transform
      //console.log("form-field transformer", `${this.title}(${this.name})`, v2)
      v2  = this.transformer(v2)

      return v2
    },
    //.......................................  
    statusIcon() {
      return this.statusIcons[this.status]
    }
  },
  ////////////////////////////////////////////////
  methods : {
    onChanged(val) {
      // Customized value
      let v2 = val
      try {
        //console.log("this.serializer(val):", val)
        v2 = this.serializer(val)
        //console.log("field changed", val, v2)
      }
      // Invalid 
      catch(error) {
        this.$emit("invalid", {
          errMessage : ""+error,
          name  : this.name,
          value : val
        })
        return
      }
      
      // apply default
      v2 = VAL(this, v2)

      // emit event
      if(!_.isEqual(v2, this.fieldValue)) {
        this.$emit("changed", {
          name  : this.name,
          value : v2
        })
      }
    }
  }
  ////////////////////////////////////////////////
}