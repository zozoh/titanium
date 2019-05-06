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
//-------------------------------------------
export default {
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
      return /^(Number|Integer|AMS)$/.test(this.type)
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
    componentType() {
      return this.comType
    },
    componentOptions() {
      return this.comConf || {}
    },
    componentValue() {
      if(!this.data){
        return undefined
      }
      let val = this.data[this.name]

      // apply default
      let v2 = VAL(this, val)

      // Customized Transform
      v2  = this.transformer(v2)

      return v2
    },
    //.......................................  
    statusIcon() {
      return this.statusIcons[this.status]
    }
  },
  //-----------------------------------------
  methods : {
    onChanged(val) {
      // Customized value
      let v2 = val
      try {
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
      this.$emit("changed", {
        name  : this.name,
        value : v2
      })
    }
  }
  //-----------------------------------------
}