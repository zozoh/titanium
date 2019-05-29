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
    "text" : {
      type : String,
      default : null
    },
    "opened" : {
      type : Boolean,
      default : false
    },
    "clearIcon" : {
      type : [String, Object],
      default : null
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
    showBtn() {
      return (this.loading && this.loadingIcon)
              || (this.opened && this.openedIcon)
              || this.icon 
              || this.text
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