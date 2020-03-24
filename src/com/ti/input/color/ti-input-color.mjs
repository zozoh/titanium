export default {
  ////////////////////////////////////////////////////
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data: ()=>({
    hideBorder : false,
    status  : "collapse"
  }),
  ////////////////////////////////////////////////////
  props : {
    "value" : {
      type : [String, Number],
      default : null
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-empty"  : !this.hasValue,
        "is-valued" : this.hasValue,
        "show-border"  : !this.hideBorder,
        "hide-border"  : this.hideBorder,
      }, this.className)
    },
    //------------------------------------------------
    colorStyle() {
      let color = Ti.Types.toColor(this.value, null)
      if(color) {
        return {"background":color.rgba}
      }
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.status},
    isExtended() {return "extended"==this.status},
    //------------------------------------------------
    hasValue() {
      return !Ti.Util.isNil(this.value)
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onToggleDrop() {
      this.status = ({
        "collapse" : "extended",
        "extended" : "collapse"
      })[this.status]
    },
    //------------------------------------------------
    onClearColor() {
      this.$notify("change", null)
    },
    //------------------------------------------------
    onColorChanged(color) {
      let co = Ti.Types.toColor(color)
      this.$notify("change", co ? co.toString() : null)
    },
    //------------------------------------------------
    doCollapse() {
      this.status = "collapse"
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}