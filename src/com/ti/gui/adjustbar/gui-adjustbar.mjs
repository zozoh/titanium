export default {
  /////////////////////////////////////////
  data: () => ({
    blockSizes: undefined
  }),
  /////////////////////////////////////////
  props: {
    "prevMinimum": {
      type: Boolean,
      default: false
    },
    "selfMinimum": {
      type: Boolean,
      default: false
    },
    "adjacentMode": {
      type: String,
      default: "none",
      validator: v => /^(none|prev|self|both)$/.test(v)
    },
    "adjustBarAt": {
      type: String,
      default: "none",
      validator: v => /^(none|left|right|top|bottom)$/.test(v)
    },
    "adjustIndex": {
      type: Array,
      validator: v => _.isUndefined(v)
        || (_.isArray(v) && 2 == v.length)
    },
    "adjustMode": {
      type: String,
      validator: v => _.isUndefined(v)
        || /^(col|row)-resize$/.test(v)
    },
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return Ti.Css.mergeClassName(
        `at-${this.adjustBarAt}`,
        this.className
      )
    },
    //--------------------------------------
    PrevIsHead() {
      return this.adjustIndex && 0 === this.adjustIndex[0]
    },
    //--------------------------------------
    ArrowCanDirections() {
      if ("col-resize" == this.adjustMode) {
        return ["left", "right"]
      }
      return ["up", "down"]
    },
    //--------------------------------------
    hasMiniArrow() {
      return this.MiniArrowAt ? true : false
    },
    //--------------------------------------
    MiniArrowAt() {
      let arrows = this.ArrowCanDirections;
      if ("prev" == this.adjacentMode) {
        return arrows[1];
      }
      else if ("self" == this.adjacentMode) {
        return arrows[0];
      }
      else if ("both" == this.adjacentMode) {
        if (this.PrevIsHead) {
          return arrows[1];
        }
        return arrows[0];
      }
    },
    //--------------------------------------
    MiniArrowTo() {
      // Arrows
      let arrows = this.ArrowCanDirections;

      // Then get the arrow
      let I = 0;
      if ("prev" == this.adjacentMode) {
        I = this.prevMinimum ? 1 : 0
      }
      else if ("self" == this.adjacentMode) {
        I = this.selfMinimum ? 0 : 1
      }
      else if ("both" == this.adjacentMode) {
        if (this.PrevIsHead) {
          I = this.prevMinimum ? 1 : 0
        } else {
          I = this.selfMinimum ? 0 : 1
        }
      }

      // Done
      return arrows[I];
    },
    //--------------------------------------
    MiniArrowClass() {
      let miniTo = this.MiniArrowTo
      if (miniTo) {
        return `zmdi zmdi-chevron-${miniTo}`
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    genNotifyContext() {
      return {
        prevMinimum: this.prevMinimum,
        selfMinimum: this.selfMinimum,
        adjacentMode: this.adjacentMode,
        adjustMode: this.adjustMode,
        adjustBarAt: this.adjustBarAt,
        adjustIndex: this.adjustIndex
      }
    },
    //--------------------------------------
    OnClickReset() {
      let payload = this.genNotifyContext()
      this.$notify("bar:reset", payload)
    },
    //--------------------------------------
    OnClickMini() {
      //console.log("OnClickMini")
      let payload = this.genNotifyContext()
      this.$notify("bar:toggle:size", payload)
    },
    //--------------------------------------
  }
  //////////////////////////////////////////
}