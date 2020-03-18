export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : null
    },
    "comType" : {
      type : String,
      default : "ti-loading"
    },
    "comConf" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  methods : {
    onArenaEvent({name="gui-arena-event", args=[]}={}) {
      this.$emit(name, ...args)
    }
  }
  //////////////////////////////////////////
}