const _M = {
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
        ? "wn-combo-multi-input"
        : "wn-combo-input"
    },
    //------------------------------------------------
    TheDropDisplay() {
      if(this.dropDisplay)
        return this.dropDisplay;

      return ["@<thumb>", "title|nm"]
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
export default _M;