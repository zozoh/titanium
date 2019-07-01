export default {
  /////////////////////////////////////////
  computed : {
    xyz() {
      console.log(this.$store.state.currentPage)
      return this.$store.state.currentPage
    }
  },
  /////////////////////////////////////////
}