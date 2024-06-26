export default {
  ///////////////////////////////////////////////////////
  props: {
    //---------------------------------------------------
    // Data
    //---------------------------------------------------
    "value": {
      type: [String, Number],
      default: null
    },
    //---------------------------------------------------
    // Behavior
    //---------------------------------------------------
    "majorColors": {
      type: Array,
      default: () => ["#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00",
        "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff"]
    },
    // List the colors at first rows
    "topColors": {
      type: Array,
      default: () => ["#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3",
        "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc"]
    },
    // List the colors at last rows
    // it should same lenght with topColors
    "bottomColors": {
      type: Array,
      default: () => ["#5b0f00", "#660000", "#783f04", "#7f6000", "#274e13",
        "#0c343d", "#1c4587", "#073763", "#20124d", "#4c1130"]
    },
    // How many middle colors between the head and bottom
    "middleDegree": {
      type: Number,
      default: 5
    },
    "showAlpha": {
      type: Boolean,
      default: true
    },
    "notifyClick": {
      type: String,
      default: "change"
    },
    "notifyHex": {
      type: String,
      default: "change"
    },
    "notifyAlpha": {
      type: String,
      default: "change"
    }
  },
  ///////////////////////////////////////////////////////
  computed: {
    //---------------------------------------------------
    theColor() {
      return Ti.Types.toColor(this.value, null)
    },
    //---------------------------------------------------
    theHex() {
      if (this.theColor)
        return this.theColor.hex
    },
    //---------------------------------------------------
    theAlpha() {
      if (this.theColor)
        return Math.round(this.theColor.alpha * 100)
    },
    //---------------------------------------------------
    theColorValue() {
      if (this.theColor)
        return this.theColor.rgba
      return Ti.I18n.get("empty")
    },
    //---------------------------------------------------
    colCount() {
      return this.topColors.length
    },
    //---------------------------------------------------
    colorGrays() {
      let grays = []
      let step = 255 / this.colCount
      for (let i = 0; i < this.colCount; i++) {
        let v = Math.round((i + 1) * step)
        grays.push(Ti.Types.toColor(v))
      }
      return grays
    },
    //---------------------------------------------------
    colorMajors() {
      let majors = []
      for (let v of this.majorColors) {
        majors.push(Ti.Types.toColor(v))
      }
      return majors
    },
    //---------------------------------------------------
    colorMatrix() {
      // Head Colors
      let tops = []
      for (let v of this.topColors) {
        tops.push(Ti.Types.toColor(v))
      }
      // Bottom colors
      let bottoms = []
      for (let v of this.bottomColors) {
        bottoms.push(Ti.Types.toColor(v))
      }
      // Middle Colors
      let matrix = [tops]
      for (let y = 0; y < this.middleDegree - 1; y++) {
        let rows = []
        for (let x = 0; x < this.colCount; x++) {
          let top = tops[x]
          let bottom = bottoms[x]
          let pos = (y + 1) / this.middleDegree
          let color = top.between(bottom, pos)
          color.adjustByHSL({ s: .5 })
          rows.push(color)
        }
        matrix.push(rows)
      }
      // The bottom
      matrix.push(bottoms)
      // Return the matrix
      return matrix
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods: {
    //---------------------------------------------------
    colorItemStyle(color) {
      return {
        "background-color": color.rgb
      }
    },
    //---------------------------------------------------
    OnHexChanged(evt) {
      if (this.notifyHex) {
        let hex = _.trim(evt.target.value)
        if (/^[0-9a-f]{3,6}$/i.test(hex)) {
          hex = "#" + hex
        }
        let co = Ti.Types.toColor(hex)
        if (this.showAlpha && _.isNumber(this.theAlpha)) {
          co.alpha = this.theAlpha / 100
        }
        this.$notify(this.notifyHex, co)
      }
    },
    //---------------------------------------------------
    OnAlphaChanged(a) {
      if (this.notifyAlpha && this.showAlpha) {
        let co = this.theColor
          ? this.theColor.clone()
          : Ti.Types.toColor("black")
        co.alpha = a / 100
        this.$notify(this.notifyAlpha, co)
      }
    },
    //---------------------------------------------------
    OnColorClicked(color) {
      if (this.notifyClick) {
        let co = color.clone()
        if (this.showAlpha && _.isNumber(this.theAlpha)) {
          co.alpha = this.theAlpha / 100
        }
        this.$notify(this.notifyClick, co)
      }
    }
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}