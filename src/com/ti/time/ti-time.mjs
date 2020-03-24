export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "value" : {
      type : [String, Number, Date, Ti.Types.Time],
      default : null
    },
    /***
     * Value unit when value is Number
     */
    "valueUnit" : {
      type : String,
      default : "s",
      validator : function(unit) {
        return /^(ms|s|min|hr)$/.test(unit)
      }
    },
    // Display mode
    "mode" : {
      type : String,
      default : "auto",
      /***
       * - `sec`  : "HH:mm:ss"
       * - `min`  : "HH:mm"
       * - `auto` : "HH:mm:ss"
       */
      validator : function(unit) {
        return /^(sec|min|auto)$/.test(unit)
      }
    },
    // the height of drop list
    "width" : {
      type : [Number, String],
      default : null
    },
    // the height of drop list
    "height" : {
      type : [Number, String],
      default : 200
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    topStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //------------------------------------------------
    theTime() {
      return Ti.Types.toTime(this.value||0, {
        unit: this.valueUnit
      })
    },
    //------------------------------------------------
    theListGroup() {
      let re = [
        this.createList("hours",   0, 24, this.theTime.hours),
        this.createList("minutes", 0, 60, this.theTime.minutes)
      ]
      if(/^(auto|sec)$/.test(this.mode)) {
        re.push(this.createList("seconds", 0, 60, this.theTime.seconds))
      }
      return re
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    createList(key, fromVal, toVal, currentVal=0) {
      let list = {
        key,
        currentId : `R-${currentVal}`,
        data    : []
      }
      for(let i=fromVal; i<toVal; i++) {
        list.data.push({
          id : `R-${i}`,
          value : i,
          text  : _.padStart(i, 2, '0')
        })
      }
      return list
    },
    //------------------------------------------------
    onListSelected(key, {current}={}) {
      let tm = this.theTime.clone()
      tm[key] = _.get(current, "value") || 0
      this.$notify("change", tm)
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}