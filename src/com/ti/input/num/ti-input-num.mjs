const _M = {
  ////////////////////////////////////////////////////
  props : {
    "value" : null,
    "defaultValue" : {
      type : Number,
      default : 0
    },
    "placeholder" : {
      type : [Number, String]
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
    },
    "width" : {
      type : [Number, String],
      default : 200
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    TopClass() {
      return this.getTopClass()
    },
    TopStyle() {
      return Ti.Css.toStyleRem100({
        width: this.width
      })
    },
    DesreaseClass() {
      if(!_.isUndefined(this.minValue) && this.value <= this.minValue) {
        return "is-disabled"
      }
      return "is-enabled"
    },
    IncreaseClass() {
      if(!_.isUndefined(this.maxValue) && this.value >= this.maxValue) {
        return "is-disabled"
      }
      return "is-enabled"
    },
    TheValue() {
      if(isNaN(this.value) 
         || !_.isNumber(this.value)) {
        return
      }
      return this.getValue(this.value)
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
      let val = this.TheValue
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
        // Notify nil
        if(_.isEmpty(str)) {
          this.$notify("change", null)  
        }
        // Notify value
        else {
          let val = str ? str * 1 : this.defaultValue
          if(!isNaN(val)) {
            let v2 = this.getValue(val)
            this.$notify("change", v2)  
          }
        }
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
export default _M;