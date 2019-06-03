export default {
  ///////////////////////////////////////
  props : {
    data :{
      type : Array,
      default : ()=>[]
    },
    align : {
      type : String,
      default : "left",
      validator : function(val) {
        return ["left","right","center"].indexOf(val)!=-1
      }
    },
    status : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////
  methods : {
    invokeAction : _.debounce(function(action){
      //console.log("invokeAction", action)
      let vm = this
      let m = /^([a-zA-Z0-9_]+):(.+)$/.exec(action)
      if(m) {
        let $app = Ti.App(vm)
        let func = $app[m[1]]
        let arg  = m[2]
        if(_.isFunction(func) && arg) {
          func.apply($app, [arg])
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