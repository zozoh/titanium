function BOOL(val) {
  return val ? true : false
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
      if(_.isFunction(this.transformer)){
        val = this.transformer(val)
      }
      return val
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
      if(_.isUndefined(v2) && !_.isUndefined(this.undefinedAs)){
        v2 = _.cloneDeep(this.undefinedAs)
      }
      if(_.isNull(v2) && !_.isNull(this.nullAs)){
        v2 = _.cloneDeep(this.nullAs)
      }
      this.$emit("changed", {
        name  : this.name,
        value : v2
      })
    }
  }
  //-----------------------------------------
}