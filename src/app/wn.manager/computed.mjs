export default {
  mainData() {
    return this.$store.state.main
  },
  mainComIcon() {
    let icon = this.mainView ? this.mainView.comIcon : null
    return icon || "extension"
  },
  mainComName() {
    return this.mainView ? this.mainView.comName : null
  },
  mainModType() {
    return this.mainView ? this.mainView.comType : null
  }
}