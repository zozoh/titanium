export default {
  inheritAttrs : false,
  ///////////////////////////////////////////
  props : {
    "type" : {
      type : String,
      default : "cols"
    },
    "adjustable" : {
      type : Boolean,
      default : true
    }
  },
  ///////////////////////////////////////////
  computed : {
    topClass() {
      let klass = ["ti-layout"]
      klass.push(`as-${this.type}`)
      return klass.join(" ")
    }
  },
  ///////////////////////////////////////////
  methods : {
    
  }
  ///////////////////////////////////////////
}