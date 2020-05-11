export default {
  /////////////////////////////////////////
  props : {
    "value": {
      type : [String, Number],
      default : "Web Text"
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    TheValue() {
      return this.value
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}