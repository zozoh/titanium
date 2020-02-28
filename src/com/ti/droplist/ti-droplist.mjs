export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "multi" : {
      type : Boolean,
      default : false
    },
    "options" : {
      type : Array,
      default : ()=>[]
    },
    "dropComType" : undefined
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    theComType() {
      if(this.multi) {
        return "ti-combo-multi-input"
      }
      return "ti-combo-input"
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    
  }
  ////////////////////////////////////////////////////
}