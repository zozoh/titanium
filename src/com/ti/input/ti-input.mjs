export default {
  props : {
    "value" : null,
    "trimed" : {
      type : Boolean,
      default : true
    },
    "format" : {
      type : [String, Array, Object],
      default : undefined
    }
  },
  computed : {
    theValue() {
      //console.log("input value:", this.value)
      return Ti.Types.toStr(this.value, this.format)
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