export default {
  /////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : null
    },
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