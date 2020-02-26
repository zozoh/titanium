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
    topClass() {
      return this.getTopClass()
    },
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