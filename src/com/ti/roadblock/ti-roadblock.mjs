/***
 * In Building ....
 */
export default {
  /////////////////////////////////////////
  props : {
    "icon" : {
      type: String,
      default: "fas-exclamation-triangle"
    },
    "text" : {
      type: String,
      default: null
    }
  },
  //////////////////////////////////////////
  computed : {
    TopClass() {
      return this.getTopClass()
    }
  }
  //////////////////////////////////////////
}