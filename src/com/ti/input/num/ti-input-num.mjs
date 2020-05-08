export default {
  ////////////////////////////////////////////////////
  props : {
    "value" : null,
    "defaultValue" : {
      type : Number,
      default : 0
    },
    "maxValue" : {
      type : Number,
      default : undefined
    },
    "minValue" : {
      type : Number,
      default : undefined
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
      if(isNaN(this.value) 
         || !_.isNumber(this.value)) {
        return
      }
      return this.getValue(this.value)
    },
    desreaseClass() {
      if(!_.isUndefined(this.minValue) && this.value <= this.minValue) {
        return "is-disabled"
      }
      return "is-enabled"
    },
    increaseClass() {
      if(!_.isUndefined(this.maxValue) && this.value >= this.maxValue) {
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
      if(!_.isUndefined(this.minValue) && val < this.minValue) {
        return this.minValue
      }
      if(!_.isUndefined(this.maxValue) && val > this.maxValue) {
        return this.maxValue
      }
      return val
    },
    //------------------------------------------------
    changeByStep(n=0) {
      let val = this.theValue
      // Start with default value
      if(_.isUndefined(val)) {
        val = this.defaultValue
      }
      // change by step
      else {
        val += (n * this.step)
      }
      // Eval the min/max range
      val = this.getValue(val)

      // Emit change
      if(val != this.value) {
        this.$notify("change", val)
      }
    },
    //------------------------------------------------
    onChanged($event) {
      let $in = $event.target
      if(_.isElement($in)) {
        let str = _.trim($in.value)
        let val = str ? str * 1 : this.defaultValue
        if(!isNaN(val)) {
          this.$notify("change", val)  
        }
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}