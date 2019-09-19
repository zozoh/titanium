export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    "comType" : {
      type : String,
      default : null
    },
    "comConf" : {
      type : Object,
      default : ()=>({})
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
  },
  //////////////////////////////////////////
  computed : {
  },
  //////////////////////////////////////////
  methods : {
  }
}