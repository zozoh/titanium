/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    // i18n string to present the field display text
    "title" : {
      type : String,
      default : null
    },
    // Auto wrap table, true:nowrap, false:wrap
    "nowrap" : {
      type : Boolean,
      default : false
    },
    // Array[{title,display}]
    "display" : {
      type : Array,
      default : ()=>[]
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    conClass() {
      return {
        "is-nowrap" : this.nowrap
      }
    }
  }
  ///////////////////////////////////////////////////
}