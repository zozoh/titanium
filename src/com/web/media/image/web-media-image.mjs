export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "src" : {
      type : String,
      default : undefined
    },
    "value": {
      type : [String, Number],
      default : undefined
    },
    "bgColor": {
      type : [String, Number],
      default: "#000000"
    },
    // [{text:"xxx", className:"xxx", cssStyle:""}]
    // [{src:"xxx",  className:"xxx", cssStyle:""}]
    "items" : {
      type : [Array],
      default : ()=>[]
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TheItems() {
      let list = []
      _.forEach(this.items, it => {

      })
      return list
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}