export default {
  inheritAttrs : false,
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
  }
  //////////////////////////////////////////
}