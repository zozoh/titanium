export default {
  inheritAttrs : false,
  ///////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "data" :{
      type : Array,
      default : ()=>[]
    },
    "align" : {
      type : String,
      default : "center",
      validator : function(val) {
        return ["left","right","center"].indexOf(val)!=-1
      }
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    "cols" : {
      type : Number,
      default : 4
    },
    "moreIcon" : {
      type : String,
      default : "fas-bars"
    },
    "moreIconSize" :{
      type : String,
      default : ".24rem"
    },
    "closeIcon" : {
      type : String,
      default : "fas-times"
    },
    "displayMode" : {
      type : String,
      default : "auto"  // auto|desktop|tablet|phone
    }
  },
  ///////////////////////////////////////////
  computed : {
    //---------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    isShowForMobile() {
      if("auto" == this.displayMode) {
        return this.isViewportModePhoneOrTablet
      }
      return this.displayMode != "desktop"
    }
  },
  ///////////////////////////////////////////
  methods : {
    invokeAction : _.debounce(function(action){
      //console.log("invokeAction", action)
      let vm = this
      let m = /^([a-zA-Z0-9_]+):([^()]+)(\((.+)\))?$/.exec(action)
      if(m) {
        let mode = m[1]
        let tanm = m[2]
        let arg0 = m[4]
        let args = []
        let func, context
        //...............................
        // Call parent
        if('parent' == mode) {
          func = this.$parent[tanm]
          context = this.$parent
        }
        // Call App
        else {
          let $app = Ti.App(vm)
          func = $app[mode]
          context = $app
          args.push(tanm)
        }
        //...............................
        // Do Invoke
        if(_.isFunction(func) && tanm) {
          if(arg0) {
            let payload = Ti.S.toJsValue(arg0)
            args.push(payload)
          }
          func.apply(context, args)
          return
        }
      }
      // Fail to found function
      // Then emit the action
      //throw Ti.Err.make("e-ti-menu-action-InvalidAction", action)
      this.$emit(action)
    }, 500, {
      leading  : true,
      trailing : false
    })
  }
  ///////////////////////////////////////////
}