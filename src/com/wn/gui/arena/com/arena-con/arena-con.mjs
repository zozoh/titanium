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
    },
    "hijackable" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  methods : {
    async hijackEmit(name, args) {
      console.log("ArenaCon", name, args)
      if(/^block:(show|hide|event)$/.test(name)) {
        await this.$emit(name, ...args)
      }
      // Gen Block Event
      else {
        await this.$emit("arena:event", {
          name, args
        })
      }
    }
  }
  //////////////////////////////////////////
}