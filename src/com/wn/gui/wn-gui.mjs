export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  data : function(){
    return {
      "shown" : {}
    }
  },
  /////////////////////////////////////////
  props : {
    "data" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    layout() {
      if(this.data)
        return this.data.layout
      return {}
    },
    schema() {
      if(this.data)
        return this.data.schema
      return {}
    }
  },
  //////////////////////////////////////////
  watch : {
    // Notify wn-manager update the action menu
    "data.actions" : function(){
      this.$emit("actions:updated", this.data.actions)
    }
  },
  //////////////////////////////////////////
  methods : {
    // @see ti-gui-methods.mjs#showGuiBlock
    showBlock(name) {
      this.shown = this.setGuiBlock(this.shown, name, true)
    },
    // @see ti-gui-methods.mjs#hideGuiBlock
    hideBlock(name) {
      this.shown = this.setGuiBlock(this.shown, name, false)
    }
  }
}