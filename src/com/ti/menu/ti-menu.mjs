export default {
  ///////////////////////////////////////
  props : {
    data :{
      type : Array,
      default : ()=>[]
    },
    align : {
      type : String,
      default : "center",
      validator : function(val) {
        return ["left","right","center"].indexOf(val)!=-1
      }
    },
    status : {
      type : Object,
      default : ()=>({})
    },
    cols : {
      type : Number,
      default : 4
    },
    moreIcon : {
      type : String,
      default : "fas-bars"
    },
    moreIconSize :{
      type : String,
      default : ".24rem"
    },
    closeIcon : {
      type : String,
      default : "fas-times"
    }
  },
  ///////////////////////////////////////
  methods : {
    invokeAction : _.debounce(function(action){
      //console.log("invokeAction", action)
      let vm = this
      let m = /^([a-zA-Z0-9_]+):([^()]+)(\((.+)\))?$/.exec(action)
      if(m) {
        let $app = Ti.App(vm)
        let func = $app[m[1]]
        let tanm = m[2]
        if(_.isFunction(func) && tanm) {
          let args = [tanm]
          if(m[4]) {
            let payload = Ti.S.toJsValue(m[4])
            args.push(payload)
          }
          func.apply($app, args)
        }
        // Fail to found function
        else {
          throw Ti.Err.make("e-ti-menu-action-InvalidAction", action)
        }
        //.then(()=>vm.processing = false)
      }
      // invalid action form
      else {
        throw Ti.Err.make("e-com-MiAction-invalidActionForm")
      }
    }, 500, {
      leading  : true,
      trailing : false
    })
  }
  ///////////////////////////////////////
}