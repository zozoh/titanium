export default {
  ////////////////////////////////////////////////////
  props : {
    "multi" : {
      type : Boolean,
      default : false
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    ComType() {
      return this.multi
        ? "ti-combo-multi-input"
        : "ti-combo-input"
    }
  }
  ////////////////////////////////////////////////////
}