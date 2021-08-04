export default {
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    // a float number between 0-1 to present the percentage
    "value": {
      type: Number,
      default: null
    },
    // default 1 to indicate number will round to 0.1
    "precision": {
      type: Number,
      default: 1
    },
    //------------------------------------------------
    // Aspect
    //------------------------------------------------
    "tipStyle": {
      type: Object
    },
    "barOuterStyle": {
      type: Object
    },
    "barInnerStyle": {
      type: Object
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    ProgressTip() {
      return Ti.S.toPercent(this.value, {
        fixed: this.precision,
        auto: false
      })
    },
    //------------------------------------------------
    ProgressStyle() {
      return _.assign({}, this.barInnerStyle, {
        width: this.ProgressTip
      })
    },
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}