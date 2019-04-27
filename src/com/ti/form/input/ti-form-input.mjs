export default {
  props : {
    "value" : null,
    "trimed" : {
      type : Boolean,
      default : true
    }
  },
  computed : {
    theValue() {
      console.log("input value:", this.value)
      return Ti.Types.toStr(this.value)
    }
  },
  methods : {
    onChanged() {
      let val = this.$refs.input.value
      if(this.trimed) {
        val = _.trim(val)
      }
      this.$emit("changed", val)
    }
  }
}