export default {
  ////////////////////////////////////////////////////
  props : {
    "value" : null,
    "trimed" : {
      type : Boolean,
      default : true
    },
    "format" : {
      type : [String, Array, Object],
      default : undefined
    },
    "suffix" : {
      type : String,
      default : null
    },
    "placeholder" : {
      type : [String, Number],
      default : null
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    theValue() {
      //console.log("input value:", this.value)
      return Ti.Types.toStr(this.value, this.format)
    },
    //------------------------------------------------
    inputClass() {
      return {
        "has-suffix" : this.suffix ? true : false
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onChanged() {
      if(_.isElement(this.$refs.input)) {
        let val = this.$refs.input.value
        if(this.trimed) {
          val = _.trim(val)
        }
        this.$emit("changed", val)
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}