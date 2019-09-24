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
    "comValueKey" : {
      type : String,
      default : "value"
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
      let re = _.assign({}, this.comConf)
      let comVal = this.data
      if(this.data && this.dataKey) {
        comVal = this.data[this.dataKey]
      }
      if(!_.isUndefined(comVal) && this.comValueKey) {
        re[this.comValueKey] = comVal
      }
      return re      
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    async hijackEmit(name, args) {
      // Find the serializer function
      let fn = this.comEvents[name]
      let serializer = Ti.Types.evalFunc(fn)
      console.log(this.comEvents)

      // Eval Payload
      let payload = args
      if(args && _.isArray(args) && args.length == 1) {
        payload = args[0]
      }
      // transform value if necessary
      // and emit it
      if(fn) {
        if(_.isFunction(serializer)) {
          payload = serializer(payload)
        }
        console.log("wizard-step::hijackEmit->", name, payload)      
        this.$emit("step:changed", {
          index   : this.index,
          title   : this.title,
          stepKey : this.stepKey,
          dataKey : this.dataKey,
          payload
        })
      }

      // emit event

    }
    //----------------------------------------------
  }
  ///////////////////////////////////////////////////
}