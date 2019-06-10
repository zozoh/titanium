export default {
  inheritAttrs : false,
  ///////////////////////////////////////////
  props : {
    "type" : {
      type : String,
      default : "cols"
    },
    "border" : {
      type : Boolean,
      default : false
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
      
      // Type
      klass.push(`as-${this.type}`)

      // Border
      if(this.border) {
        klass.push("show-border")
      }

      // Output class names
      return klass.join(" ")
    }
  },
  ///////////////////////////////////////////
  methods : {
    
  }
  ///////////////////////////////////////////
}