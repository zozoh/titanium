const ActionModes = {
  async dispatch(vm, arg) {
    await vm.$store.dispatch(arg)
  }
}
//---------------------------------------
export default {
  invokeAction : _.debounce(function(){
    let vm = this
    console.log("haha", this.$store)
    if(vm.action) {
      let m = /^(dispatch):(.+)$/.exec(vm.action)
      if(m) {
        // setup async action
        vm.processing = true
        // do action and recover
        let [_, mode, arg] = m
        ActionModes[mode](vm, arg)
          .then(()=>vm.processing = false)
      }
      // invalid action form
      else {
        throw Ti.Err.make("e-com-MiAction-invalidActionForm")
      }
    }
  }, 500, {leading:true})
}