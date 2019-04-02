const ActionModes = {
  async dispatch(vm, actionPath) {
    let $app = Ti.App(vm)
    // TiApp
    if($app) {
      await $app.dispatch(actionPath)
    }
    // Pure Vuex
    else if(vm.$store){
      await vm.$store.dispatch(actionPath)
    }
    // Imposseble
    else {
      throw Ti.Err.make("e-ti-menu-action-CanNotDispatch", {vm, actionPath})
    }
  }
}
//---------------------------------------
export default {
  invokeAction : _.debounce(function(){
    let vm = this
    if(vm.action && vm.isEnabled) {
      let m = /^([a-zA-Z0-9_]+):(.+)$/.exec(vm.action)
      if(m) {
        let $app = Ti.App(vm)
        let func = $app[m[1]]
        let arg  = m[2]
        if(_.isFunction(func) && arg) {
          func.apply($app, [arg])
        }
        // Fail to found function
        else {
          throw Ti.Err.make("e-ti-menu-action-InvalidAction", vm.action)
        }
        //.then(()=>vm.processing = false)
      }
      // invalid action form
      else {
        throw Ti.Err.make("e-com-MiAction-invalidActionForm")
      }
    }
  }, 500, {
    leading  : true,
    trailing : false
  })
}