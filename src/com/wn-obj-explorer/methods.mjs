export default {
  onItemSelected(index, mode) {
    this.$store.commit("main/selectItem", {index, mode})
  },
  onItemOpen(index) {
    let meta = _.nth(this.data.children, index)
    if(meta) {
      this.$emit("open", meta)
    }
  },
  onItemBlur() {
    this.$store.commit("main/blurAll")
  }
}