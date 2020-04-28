export default {
  /////////////////////////////////////////
  props : {
    "value": {
      type : [String, Number],
      default : "Web Text"
    },
    "cssStyle": {
      type : Object,
      default: undefined
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle(this.cssStyle)
    },
    //--------------------------------------
    TheValue() {
      return this.value
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}