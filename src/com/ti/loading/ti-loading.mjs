export default {
  props : {
    icon : {
      type : [String, Object],
      default : "fas-spinner fa-spin"
    },
    text : {
      type : String,
      default : "i18n:loading"
    }
  },
  computed : {
    TopClass() {
      return this.getTopClass()
    }
  }
}