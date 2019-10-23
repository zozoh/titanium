export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "icon" : {
      type : [String,Object],
      default : ""
    },
    "text" : {
      type : String,
      default : null
    }
  }
  ///////////////////////////////////////////////////////
}