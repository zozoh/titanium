export default {
  props : {
    "data" : {
      type : Object,
      default : ()=>({})
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    "dataIsChanged" : {
      type : Boolean,
      default : false
    }
  }
}