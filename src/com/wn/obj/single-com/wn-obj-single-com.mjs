export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    "comType" : {
      type : String,
      default : null
    },
    "comConf" : {
      type : Object,
      default : ()=>({})
    },
    "data" : {
      type : [Array, Object, Number, Boolean, String],
      default : null
    },
    "dataKey" : {
      type : String,
      default : "data"
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    "comEvents" : {
      type : Object,
      default : ()=>({})
    },
    "hijackable" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  computed : {
    comBindObject() {
      let re = _.assign({}, this.comConf)
      re[this.dataKey] = this.data
      return re      
    }
  },
  //////////////////////////////////////////
  methods : {
    //----------------------------------------------
    async hijackEmit(name, args) {
      // Find the serializer function
      let action = this.comEvents[name]

      // Eval Payload
      let payload = args
      if(args && _.isArray(args) && args.length == 1) {
        payload = args[0]
      }
      // dispatch action
      if(action) {
        console.log("wn-obj-signle-com::hijackEmit->", name, payload)
        Ti.App(this).dispatch(action, payload)
        
      }
    }
  }
}