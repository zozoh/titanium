export default {
  ////////////////////////////////////////////////////
  data: () => ({
    hideBorder: false,
    status: "collapse"
  }),
  ////////////////////////////////////////////////////
  props: {
    "value": {
      type: [String, Number],
      default: null
    },
    "autoCollapse": {
      type: Boolean,
      default: true
    },
    "showAlpha": {
      type: Boolean,
      default: true
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-empty": !this.hasValue,
        "is-valued": this.hasValue,
        "show-border": !this.hideBorder,
        "hide-border": this.hideBorder,
      }, this.className)
    },
    //------------------------------------------------
    colorStyle() {
      let color = Ti.Types.toColor(this.value, null)
      if (color) {
        return { "background": color.rgba }
      }
    },
    //------------------------------------------------
    isCollapse() { return "collapse" == this.status },
    isExtended() { return "extended" == this.status },
    //------------------------------------------------
    hasValue() {
      return !Ti.Util.isNil(this.value)
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    OnToggleDrop() {
      this.status = ({
        "collapse": "extended",
        "extended": "collapse"
      })[this.status]
    },
    //------------------------------------------------
    OnClearColor() {
      this.$notify("change", null)
    },
    //------------------------------------------------
    OnColorChange(color, mode) {
      //console.log("OnColorChanged", color, mode)
      let co = Ti.Types.toColor(color)
      this.$notify("change", co ? co.toString() : null)
      if (this.autoCollapse && "color" == mode) {
        this.status = "collapse"
      }
    },
    //------------------------------------------------
    doCollapse() {
      this.status = "collapse"
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}