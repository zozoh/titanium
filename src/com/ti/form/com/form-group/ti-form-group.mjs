export default {
  inheritAttrs: false,
  ///////////////////////////////////////////
  computed : {
    show() {
      return {
        title : this.title ? true : false,
        icon  : this.icon  ? true : false
      }
    }
  },
  ///////////////////////////////////////////
  methods : {
    onChanged(payload) {
      //console.log("changed", payload)
      this.$emit("changed", payload)
    },
    onInvalid(payload) {
      //console.log("invalid", payload)
      this.$emit("invalid", payload)
    }
  }
  ///////////////////////////////////////////
}