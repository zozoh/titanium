export default {
  onTopSelect(eo) {
    let vm = this
    let mode = "active"
    // shift key on: batch
    if(eo.shiftKey) {
      mode = "shift"
    }
    // ctrl key on: toggle
    else if(eo.ctrlKey || eo.metaKey) {
      mode = "toggle"
    }
    vm.$emit('selected', vm.index, mode)
  },
  onTopOpen(eo) {
    let vm = this
    if(vm.highlight) {
      vm.$emit('open', vm.index)
    }
  }
}