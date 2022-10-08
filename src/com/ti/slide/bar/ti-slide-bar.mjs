export default {
  ///////////////////////////////////////////////////////
  data: () => ({
    myConWidth: 0,
    myConHeight: 0,
    myHdlLeft: 0,
    myValue: undefined
  }),
  ///////////////////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value": {
      type: Number,
      default: undefined
    },
    "maxValue": {
      type: Number,
      default: 1
    },
    "minValue": {
      type: Number,
      default: 0
    },
    "markBegin": {
      type: Number,
      default: undefined
    },
    "markEnd": {
      type: Number,
      default: undefined
    },
    "precision": {
      type: Number,
      default: 2
    },
    "format": {
      type: [Function, String],
      default: undefined
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    // 0 : notify when dragging done
    // > 0 : notify during dragging with throttle
    "notifyFrequency": {
      type: Number,
      default: 0
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "prefixText": {
      type: [Boolean, String],
      default: true,
      validator: v => (_.isBoolean(v) || /^(current|min|none)$/.test(v))
    },
    "suffixText": {
      type: [Boolean, String],
      default: true,
      validator: v => (_.isBoolean(v) || /^(current|max|none)$/.test(v))
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "textWidth": {
      type: [Number, String],
      default: undefined
    },
    "barHeight": {
      type: [Number, String],
      default: undefined
    },
    "width": {
      type: [Number, String],
      default: undefined
    },
    "height": {
      type: [Number, String],
      default: undefined
    }
  },
  ///////////////////////////////////////////////////////
  computed: {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-show-prefix": this.isShowPreifx,
        "is-show-suffix": this.isShowSuffix
      })
    },
    //---------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    },
    //---------------------------------------------------
    TextStyle() {
      return Ti.Css.toStyle({
        width: this.textWidth,
      })
    },
    //---------------------------------------------------
    BarStyle() {
      return Ti.Css.toStyle({
        height: this.barHeight,
      })
    },
    //---------------------------------------------------
    TheValueSize() {
      let left = this.myConWidth * this.myHdlLeft
      return Ti.Css.toSize(left)
    },
    BarInnerStyle() {
      return { width: this.TheValueSize }
    },
    HandlerStyle() {
      return { left: this.TheValueSize }
    },
    //---------------------------------------------------
    BarMarkStyle() {
      if (_.isNumber(this.markBegin) && _.isNumber(this.markEnd)) {
        let left = this.calScale(this.markBegin)
        let width = this.calScale(this.markEnd - this.markBegin)
        return Ti.Css.toStyle({
          left, width
        })
      }
    },
    //---------------------------------------------------
    FormatValue() {
      if (_.isString(this.format)) {
        if (this.format.startsWith("=>")) {
          let str = this.format.substring(2).trim()
          return Ti.Util.genInvoking(str, { partial: "right" })
        }
        return (val) => {
          return Ti.S.renderBy(this.format, { val })
        }
      }
      if (_.isFunction(this.format)) {
        return this.format;
      }
      return v => v
    },
    //---------------------------------------------------
    MaxValueText() {
      return this.FormatValue(this.maxValue) + ""
    },
    //---------------------------------------------------
    MinValueText() {
      return this.FormatValue(this.minValue) + ""
    },
    //---------------------------------------------------
    CurrentValueText() {
      return this.FormatValue(this.myValue) + ""
    },
    //---------------------------------------------------
    TextContext() {
      return {
        current: this.CurrentValueText,
        min: this.MinValueText,
        max: this.MaxValueText
      }
    },
    //---------------------------------------------------
    ThePrefixText() {
      if (this.prefixText) {
        if (_.isBoolean(this.prefixText)) {
          return this.CurrentValueText || this.MinValueText
        }
        return _.get(this.TextContext, this.prefixText)
      }
    },
    //---------------------------------------------------
    TheSuffixText() {
      if (this.suffixText) {
        if (_.isBoolean(this.suffixText)) {
          if(!this.prefixText) {
            return this.CurrentValueText
          }
          return this.MaxValueText
        }
        return _.get(this.TextContext, this.suffixText)
      }
    },
    //---------------------------------------------------
    isShowPreifx() { return this.textWidth && this.ThePrefixText },
    isShowSuffix() { return this.textWidth && this.TheSuffixText },
    //---------------------------------------------------
    ThrottleSetVal() {
      if (this.notifyFrequency > 0) {
        return _.throttle(scale => {
          this.evalMyVal(scale)
        }, this.notifyFrequency)
      }
    },
    //---------------------------------------------------
    Draggable() {
      return {
        trigger: ".as-hdl",
        viewport: ".as-con",
        prepare: ({ scaleX }) => {
          let scale = _.clamp(scaleX, 0, 1)
          let value = this.calValue(scale)
          this.$notify("drag:begin", { value, scale })
        },
        dragging: ({ scaleX }) => {
          this.evalMyHdlLeft(scaleX)
          if (this.ThrottleSetVal) {
            this.ThrottleSetVal(this.myHdlLeft)
          }
        },
        done: ({ scaleX }) => {
          this.evalMyHdlLeft(scaleX)
          this.evalMyVal(scaleX)
          this.$notify("drag:end", {
            value: this.myValue,
            scale: this.myHdlLeft
          })
        }
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods: {
    //--------------------------------------------------
    OnResize() {
      if (_.isElement(this.$refs.con)) {
        let { width, height } = this.$refs.con.getBoundingClientRect()
        this.myConWidth = width
        this.myConHeight = height
      }
    },
    //---------------------------------------------------
    OnClickBar(evt) {
      if (evt.srcElement == this.$refs.hdl) {
        return
      }
      let { left, width } = Ti.Rects.createBy(this.$refs.con)
      let clientX = evt.clientX
      let scale = (clientX - left) / width
      console.log("OnClickBar", scale)
      this.evalMyHdlLeft(scale)
      this.evalMyVal(scale)
    },
    //---------------------------------------------------
    calScale(val) {
      let sum = this.maxValue - this.minValue
      if (sum != 0)
        return val / sum
    },
    //---------------------------------------------------
    calValue(scale) {
      scale = _.clamp(scale, 0, 1)
      let val = (this.maxValue - this.minValue) * scale
      val = Ti.Num.precise(val, this.precision)
      //console.log("calValue:", val)
      return val
    },
    //---------------------------------------------------
    evalMyHdlLeft(scale) {
      this.myHdlLeft = _.clamp(scale, 0, 1)
      //console.log("myHdlLeft:", this.myHdlLeft)
    },
    //---------------------------------------------------
    evalMyVal(scale) {
      this.myValue = this.calValue(scale)
    }
    //---------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "value": {
      handler: function (newVal, oldVal) {
        if (newVal != oldVal) {
          newVal = newVal || 0
          let scale = newVal / (this.maxValue - this.minValue)
          this.evalMyHdlLeft(scale)
          this.myValue = newVal
        }
      },
      immediate: true
    },
    "myValue": function (newVal, oldVal) {
      if (newVal != oldVal
        && !_.isUndefined(oldVal)
        && newVal != this.value) {
        this.$notify("change", this.myValue)
      }
    }
  },
  //////////////////////////////////////////////////////
  mounted: async function () {
    Ti.Viewport.watch(this, {
      resize: () => {
        this.OnResize()
      }
    })
    _.delay(() => {
      this.OnResize()
    }, this.adjustDelay || 0)
  },
  ///////////////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////////////////////////
}