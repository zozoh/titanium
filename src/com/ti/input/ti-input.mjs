export default {
  ////////////////////////////////////////////////////
  props : {
    "value" : null,
    "trimed" : {
      type : Boolean,
      default : true
    },
    "placeholder" : {
      type : [String, Number],
      default : null
    },
    "format" : {
      type : [String, Array, Object],
      default : undefined
    },
    // true : Show multi-line textarea
    "multi" : {
      type : Boolean,
      default : false
    },
    // multi-line only, indicate the textarea height
    "height" : {
      type : [Number, String],
      default : null
    },
    // For `multi=false` only
    "suffix" : {
      type : String,
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
    topClass() {
      return {
        "is-multi" : this.multi
      }
    },
    //------------------------------------------------
    multiModeClass() {
      // TODO ... maybe need nothing -_-!
    },
    //------------------------------------------------
    multiModeStyle(){
      if(this.height) {
        return {
          "height" : Ti.Css.toSize(this.height)
        }
      }
    },
    //------------------------------------------------
    inputModeClass() {
      return {
        "has-suffix" : this.suffix ? true : false
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onChanged($event) {
      let $in = $event.target
      if(_.isElement($in)) {
        let val = $in.value
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