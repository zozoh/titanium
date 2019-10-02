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
      let re = Ti.Util.explainObj(this.data||{}, this.comConf, {
        evalFunc : true
      })
      return re      
    }
  },
  //////////////////////////////////////////
  methods : {
    //----------------------------------------------
    async hijackEmit(name, args) {
      // Find the serializer function
      let act = this.comEvents[name]

      // dispatch action
      if(act) {
        //console.log("wn-obj-signle-com::hijackEmit->", name, payload)
        if(_.isString(act)) {
          act = {action:act}
        }
        Ti.App(this).dispatch("main/doAction", {
          action  : act.action,
          payload : act.payload,
          args
        })
      }
    }
  }
}