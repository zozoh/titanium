export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "blocks" : {
      type : Array,
      default : ()=>[]
    },
    "adjustable" : {
      type : Boolean,
      default : true
    },
    "border" : {
      type : Boolean,
      default : false
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "actionStatus" : {
      type : Object,
      default : ()=>({})
    },
    "shown" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-adjustable" : this.adjustable,
        "show-border"   : this.border
      }, this.className)
    },
    //--------------------------------------
    hasBlocks() {
      return !_.isEmpty(this.blocks)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    //--------------------------------------
  }
  //////////////////////////////////////////
}