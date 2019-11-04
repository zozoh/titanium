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
    "dispatchActions" : {
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
      let action = this.dispatchActions[name]
      if(!name.startsWith("hook:"))
        console.log("hahah", {name, args, action})

      // dispatch action
      if(action) {
        console.log("wn-obj-signle-com::hijackEmit->", {name, action, args})
        if(_.isString(action)) {
          action = {action:action}
        }
        Ti.App(this).dispatch("main/doAction", {
          action  : action.action,
          payload : action.payload,
          args
        })
      }
    }
  },
  ////////////////////////////////////////////
  mounted : function(){
    //----------------------------------------
    Ti.Fuse.getOrCreate().add({
      key : "wn-obj-single-com",
      everythingOk : ()=>{
        return !this.status.changed
      },
      fail : ()=>{
        Ti.Toast.Open("i18n:no-saved", "warn")
      }
    })
    //----------------------------------------
  },
  ////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-obj-single-com")
  }
}