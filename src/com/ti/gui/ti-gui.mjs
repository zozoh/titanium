export default {
  /////////////////////////////////////////
  props : {
    "type" : {
      type : String,
      // cols | rows | tabs | wall
      default : "cols"
    },
    "adjustable" : {
      type : Boolean,
      default : true
    },
    "border" : {
      type : Boolean,
      default : false
    },
    "blocks" : {
      type : Array,
      default : ()=>[]
    },
    "panels" : {
      type : Array,
      default : ()=>[]
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "shown" : {
      type : Object,
      default : ()=>({})
    },
    "canLoading" : {
      type : Boolean,
      default : false
    },
    // value should be prop of ti-loading
    "loadingAs" : {
      type : [Boolean, Object],
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    formedBlockList() {
      // @see ti-gui-methods.mjs#getFormedBlockList
      return this.getFormedBlockList(this.blocks, this.shown)
    },
    formedPanelList() {
      // @see ti-gui-methods.mjs#getFormedBlockList
      return this.getFormedBlockList(this.panels, this.shown, true)
    },
    hasPanels() {
      return !_.isEmpty(this.panels)
    },
    isLoading() {
      return this.canLoading 
             && this.loadingAs 
                  ? true 
                  : false
    },
    showLoading() {
      if(_.isPlainObject(this.loadingAs)) {
        return this.loadingAs
      }
      return {}
    }
  },
  //////////////////////////////////////////
  methods : {
    onClickPanel($event, name) {
      // if(Ti.Dom.hasClass($event.target, "gui-panel")) {
      //   console.log("click panel", name)
      //   this.$emit("block:hide", name)
      // }
    }
  }
  //////////////////////////////////////////
}