export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  data : ()=>({
    "shown" : {}
  }),
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
    "data.actions" : function(){
      this.$emit("actions:updated", this.data.actions)
    }
  },
  //////////////////////////////////////////
  methods : {
    showBlock(name) {
      this.shown = {
        ...this.shown, 
        [name]: true
      }
    },
    hideBlock(name) {
      this.shown = {
        ...this.shown, 
        [name]: false
      }
    }
  }
}