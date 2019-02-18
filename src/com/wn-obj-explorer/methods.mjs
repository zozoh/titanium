export default {
  onSelectedItem(index) {
    this.$store.commit("main/selectItem", index)
  }
}