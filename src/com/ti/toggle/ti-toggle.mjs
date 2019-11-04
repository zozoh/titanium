export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "value" : false
  },
  //////////////////////////////////////////
  computed : {
    isOff() {
      return this.value ? false : true
    },
    isOn() {
      return this.value ? true : false
    },
    //......................................
    toggleClass() {
      return {
        "is-off" : this.isOff,
        "is-on"  : this.isOn
      }
    }
  },
  //////////////////////////////////////////
  methods : {
    onClick() {
      this.$emit("changed", !this.value)
    }
  }
}