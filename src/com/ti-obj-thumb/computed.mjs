export default {
  classObject() {
    let vm = this
    return {
      "is-highlight"  : vm.highlight,
      "is-renameable" : vm.renameable
    }
  }
}