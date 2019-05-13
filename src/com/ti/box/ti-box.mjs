export default {
  /////////////////////////////////////////
  props : {
    "empty" :{
      type : Object,
      default : ()=>({
        text  : "i18n:no-selected",
        value : undefined
      })
    },
    "items" : {
      type : [Array, Object],
      default : null
    },
    "loading" : {
      type : Boolean,
      default : false
    },
    "multi" : {
      type : Boolean,
      default : false
    },
    "icon" : {
      type : [String, Object],
      default : "zmdi-chevron-down"
    },
    "opened" : {
      type : Boolean,
      default : false
    },
    "openedIcon" : {
      type : [String, Object],
      default : "zmdi-chevron-up"
    },
    "loadingIcon" : {
      type : [String, Object],
      default : "zmdi-settings zmdi-hc-spin"
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    hasItems() {
      return !_.isEmpty(this.items)
    },
    noItems() {
      return _.isEmpty(this.items)
    },
    //......................................
    // For Single mode
    firstItem() {
      if(_.isArray(this.items)){
        return _.get(this.items, 0)
      }
      return this.items || this.empty
    }
  }
  //////////////////////////////////////////
}