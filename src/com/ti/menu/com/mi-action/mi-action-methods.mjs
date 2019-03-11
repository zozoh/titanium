const ActionModes = {
  async dispatch(vm, actionPath) {
    await vm.$store.dispatch(actionPath)
  }
}
//---------------------------------------
export default {
  invokeAction : _.debounce(function(){
    let vm = this
    // console.log("haha", this.$store)
    if(vm.action) {
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
  }, 500, {leading:true})
}