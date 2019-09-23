export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    "className" : {
      type : [Array, String],
      default : null
    },
    "index" : {
      type : Number,
      default : -1
    },
    "stepKey" : {
      type : String,
      default : null
    },
    "title" : {
      type : String,
      default : null
    },
    "dataKey" : {
      type : String,
      default : null
    },
    "comType" : {
      type : String,
      default : "ti-label"
    },
    "comConf" : {
      type : Object,
      default : ()=>({
        value: "Step Component"
      })
    },
    "serializer" : {
      type : Function,
      default : _.identity
    },
    "hijackable" : {
      type : Boolean,
      default : true
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    async hijackEmit(name, args) {
      let payload = args
      if(args && _.isArray(args) && args.length == 1) {
        payload = args[0]
      }
      let p2 = this.serializer(payload)
      console.log("wizard-step::hijackEmit->", name, p2)      
    }
    //----------------------------------------------
  }
  ///////////////////////////////////////////////////
}