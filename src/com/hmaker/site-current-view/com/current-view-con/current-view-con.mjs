export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "comType" : {
      type : String,
      default : "ti-loading"
    },
    "comConf" : {
      type : Object,
      default : ()=>({})
    },
    "hijackable" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  methods : {
    hijackEmit(name, args) {
      this.$emit("current:event", {
        name, args
      })
    }
  }
  //////////////////////////////////////////
}