export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "multi" : {
      type : Boolean,
      default : false
    },
    "options" : undefined,
    "dropComType" : undefined
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    theComType() {
      if(this.multi) {
        return "wn-combo-multi-input"
      }
      return "wn-combo-input"
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    
  }
  ////////////////////////////////////////////////////
}