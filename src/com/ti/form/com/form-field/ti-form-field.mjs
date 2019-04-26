function BOOL(val) {
  return val ? true : false
}
//-------------------------------------------
export default {
  computed : {
    show() {
      let title = !_.isNull(this.fieldTitle)
      let icon = BOOL(this.icon)
      let message = BOOL(this.message)
      let status = BOOL(this.status)
      let tip = BOOL(this.tip)
      return {
        title, icon,
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
      
    },
    //.......................................  
    statusIcon() {
      return this.statusIcons[this.status]
    }
  },
  //-----------------------------------------
  methods : {
    
  }
  //-----------------------------------------
}