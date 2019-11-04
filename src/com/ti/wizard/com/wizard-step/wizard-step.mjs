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
    "data" : {
      type : [Array, Object, Number, Boolean, String],
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
    "comEvents" : {
      type : Object,
      default : ()=>({})
    },
    "hijackable" : {
      type : Boolean,
      default : true
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    comBindObject() {
      let bind = Ti.Util.explainObj(this.data, this.comConf, {
        evalFunc : true
      })
      return bind      
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    async hijackEmit(name, args) {
      // Find the serializer function
      let router = this.comEvents[name]
      if(!name.startsWith("hook:"))
        console.log("hijackEmit:", {name, args, router})

      // Do routing
      if(router) {
        // Boolean: keep emitName
        if(_.isBoolean(router)) {
          router = {emitName:name}
        }
        // String/Number: step
        else if(_.isNumber(router) || /^[+-][0-9]+$/.test(router)) {
          router = {emitName:name, nextStep:router}
        }
        // String for emitName
        else if(_.isString(router)) {
          router = {emitName:router}
        }
        //............................
        // Eval emit & next
        let emitName = router.emitName || name
        let nextStep = router.nextStep
        if(/^[+-][0-9]+$/.test(nextStep)) {
          nextStep = this.index + (nextStep*1)
        }
        //............................
        // Eval Payload
        let payload = args
        if(args && _.isArray(args) && args.length == 1) {
          payload = args[0]
        }
        // Transform Payload
        let trans = Ti.Types.getFuncBy(router, "transformer")
        if(_.isFunction(trans)) {
          payload = trans(payload)
        }
        // Wrap payload by dataKey
        if(this.dataKey) {
          payload = {[this.dataKey] : payload}
        }
        //............................
        // Notify
        this.$emit("step:event", {
          emitName, nextStep, payload
        })
        //............................
      }
    }
    //----------------------------------------------
  }
  ///////////////////////////////////////////////////
}