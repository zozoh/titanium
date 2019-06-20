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
      return this.getFormedBlockList(this.panels, this.shown)
    },
    hasPanels() {
      return !_.isEmpty(this.panels)
    }
  }
  //////////////////////////////////////////
}