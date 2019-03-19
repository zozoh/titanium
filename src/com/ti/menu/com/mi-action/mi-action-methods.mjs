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
      let m = /^(dispatch):(.+)$/.exec(vm.action)
      if(m) {
        // setup async action
        vm.processing = true
        // do action and recover
        let [_, mode, actionPath] = m
        ActionModes[mode](vm, actionPath)
          .then(()=>vm.processing = false)
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