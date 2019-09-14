export default {
  ////////////////////////////////////////////////////
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "value" : null,
    "defaultValue" : {
      type : Number,
      default : 0
    },
    "maxValue" : {
      type : Number,
      default : 10
    },
    "minValue" : {
      type : Number,
      default : 0
    },
    "step" : {
      type : Number,
      default : 1
    }
    // "width" : {
    //   type : [Number, String],
    //   default : 200
    // }
  },
  ////////////////////////////////////////////////////
  computed : {
    // topStyle() {
    //   if(_.isNumber(this.width) || this.width) {
    //     return {
    //       width : Ti.Css.toSize(this.width)
    //     }
    //   }
    // },
    theValue() {
      return this.getValue(this.value)
    },
    desreaseClass() {
      if(this.value <= this.minValue) {
        return "is-disabled"
      }
      return "is-enabled"
    },
    increaseClass() {
      if(this.value >= this.maxValue) {
        return "is-disabled"
      }
      return "is-enabled"
    }
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    getValue(val) {
      if(isNaN(val) || !_.isNumber(val)) {
        return this.defaultValue
      }
      if(val < this.minValue) {
        return this.minValue
      }
      if(val > this.maxValue) {
        return this.maxValue
      }
      return val
    },
    //------------------------------------------------
    changeByStep(n=0) {
      let val = this.theValue + (n * this.step)
      val = this.getValue(val)
      if(val != this.value) {
        this.$emit("changed", val)
      }
    },
    //------------------------------------------------
    onChanged($event) {
      let $in = $event.target
      if(_.isElement($in)) {
        let val = $in.value * 1
        if(!isNaN(val)) {
          this.$emit("changed", val)  
        }
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}