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
    }
  }
  //////////////////////////////////////////
}