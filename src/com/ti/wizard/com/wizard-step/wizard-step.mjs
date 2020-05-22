export default {
  ///////////////////////////////////////////////////
  props : {
    "index" : {
      type : Number,
      default : -1
    },
    "stepKey" : {
      type : String,
      default : null
    },
    "title" : {
      type : String,
      default : null
    },
    "comType" : {
      type : String,
      default : "ti-label"
    },
    "comConf" : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    OnChange(payload) {
      this.$emit("data:change", payload)
    }
    //----------------------------------------------
  }
  ///////////////////////////////////////////////////
}