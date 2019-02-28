export default {
  onThumbSelected(index, mode){
    //console.log("--------------------", index)
    this.$emit("selected", index, mode)
  },
  onThumbOpen(index) {
    this.$emit("open", index)
  },
  onThumbBlur() {
    this.$emit("blur")
  }
}