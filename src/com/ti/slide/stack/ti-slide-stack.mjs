/////////////////////////////////////////////////////////
const DFT_BG = ["#08F", "#F80", "#080", "#AA0", "#0AA", "#A0A"]
/////////////////////////////////////////////////////////
export default {
  ///////////////////////////////////////////////////////
  data: () => ({
    myRect: null,
    myValue: {}
  }),
  ///////////////////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value": {
      type: [Number, Object, Array],
      default: undefined
    },
    "valueType": {
      type: String,
      default: "auto",
      validator: v => /^(auto|Number|Array|Object)$/.test(v)
    },
    "precision": {
      type: Number,
      default: 2
    },
    "stacks": {
      type: [Array, Object],
      default: undefined
    },
    "capacity": {
      type: Number,
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
    "mode": {
      type: String,
      default: "H",
      validator: v => /^(H|V)$/.test(v)
    },
    "format": {
      type: [Function, String],
      default: undefined
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "inputWidth": {
      type: [String, Number]
    }
  },
  ///////////////////////////////////////////////////////
  computed: {
    //---------------------------------------------------
    TopClass() {
      let multi = this.StackItems.length > 1
      return this.getTopClass({
        "is-stack-single": !multi,
        "is-stack-multi": multi
      }, `is-mode-${this.mode}`)
    },
    //---------------------------------------------------
    LegendInputStyle() {
      if (this.inputWidth) {
        return Ti.Css.toStyle({
          width: this.inputWidth
        })
      }
    },
    //---------------------------------------------------
    TheValueType() {
      if ("auto" == this.valueType) {
        let N = this.StackItems.length
        if (N <= 1) {
          return "Number"
        }
        if (this.StackItems[0].name) {
          return "Object"
        }
        return "Array"
      }
      return this.valueType
    },
    //---------------------------------------------------
    StackItems() {
      let list = _.concat(this.stacks)
      let items = []
      _.forEach(list, (li, index) => {
        if (!li)
          return
        let name = li.name || `V${index}`
        let min = li.min || 0
        let max = li.max || 100
        let unit = li.unit || 1   // the value unit
        let dft = Ti.Util.fallback(li.dft, max)
        let background = li.background
        if (!background) {
          background = Ti.Util.nth(DFT_BG, index, "#000")
        }
        items.push({
          title: li.title,
          index, name, min, max, dft, unit,
          color: li.color || "#FFF",
          background
        })
      })
      return items;
    },
    //---------------------------------------------------
    StackMap() {
      let re = {}
      _.forEach(this.StackItems, (it) => {
        re[it.name] = it
      })
      return re
    },
    //---------------------------------------------------
    LogicMax() {
      if (this.capacity > 0) {
        return this.capacity
      }
      let re = 0
      _.forEach(this.StackItems, ({ max }) => {
        re += max
      })
      return re;
    },
    //---------------------------------------------------
    DisplaySize() {
      if ("V" == this.mode) {
        return _.get(this.myRect, "height")
      }
      return _.get(this.myRect, "width")
    },
    //---------------------------------------------------
    DisplayStackItems() {
      let list = []
      let sizeKey = "V" == this.mode ? "height" : "width"
      _.forEach(this.StackItems, it => {
        let {
          title, index, name, color, background, min, max
        } = it
        let val = _.get(this.myValue, name)
        let valueText = this.FormatValue(val)
        let percent = val / this.LogicMax
        let li = {
          title, index, name, min, max,
          value: val,
          valueText,
          percent,
          barStyle: {
            [sizeKey]: `${percent * 100}%`,
            background, color
          },
          legendNameStyle: {
            background, color
          }
        }
        list.push(li)
      })
      return list
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
    //---------------------------------------------------
    OnResize() {
      this.myRect = Ti.Rects.createBy(this.$refs.main)
    },
    //---------------------------------------------------
    OnItemChange(name, $event) {
      let v = _.trim($event.srcElement.value)
      let si = this.StackMap[name]
      //console.log(si)
      let v0 = v * 1
      if (isNaN(v0)) {
        return
      }
      v0 = Ti.Num.padTo(v0, si.unit)
      let v1 = Ti.Num.precise(v0, this.precision)
      let v2 = _.clamp(v1, si.min, si.max)
      let new0 = _.cloneDeep(this.myValue)
      new0[name] = v2
      let new1 = this.evalMyVal(new0)
      let new2 = this.padMyValToCapacity(new1, si.index)
      this.myValue = new2
      this.notifyChange()
    },
    //---------------------------------------------------
    // If capacity defined, auto pad the value to fit capcity
    padMyValToCapacity(val, fixIndex) {
      // Guard
      if (!(this.capacity > 0)) {
        return val
      }

      // 1. Get value sum
      let sum = 0;
      _.forEach(val, v => sum += v)

      // 2. Get remain
      let remain = this.capacity - sum

      if (remain == 0) {
        return val
      }

      // 3. Prepare the stack items
      let offset = Ti.Util.fallback(fixIndex, 0)
      let items = []
      let N = this.StackItems.length
      for (let i = 0; i < N; i++) {
        let itI = Ti.Num.scrollIndex(i + offset, N);
        if (itI != fixIndex) {
          let it = this.StackItems[itI]
          items.push(it)
        }
      }

      // 4. Assign remain
      let rev = _.cloneDeep(val)
      for (let it of items) {
        let { name, min, max, dft } = it
        let v = Ti.Util.fallback(val[name], dft)
        let v1 = v + remain
        let v2 = _.clamp(v1, min, max)
        rev[name] = v2
        let vd = v2 - v
        remain -= vd
        if (!remain) {
          break
        }
      }

      return rev
    },
    //---------------------------------------------------
    // make val to {V0: v ...}
    evalMyVal(val) {
      //console.log("evalMyVal", val)
      // Integer
      if (_.isNumber(val)) {
        val = [val]
      }
      let re = {};
      // Assign default value
      _.forEach(this.StackItems, ({ name, dft }) => {
        re[name] = dft
      })
      // Array
      if (_.isArray(val)) {
        let n = Math.min(val.length, this.StackItems.length)
        for (let i = 0; i < n; i++) {
          let si = this.StackItems[i]
          let v = val[i]
          if (v >= 0) {
            let k = si.name
            re[k] = Ti.Num.precise(v, this.precision)
          }
        }
      }
      // Must by Plain Object
      else {
        _.forEach(val, (v, k) => {
          let si = this.StackMap[k]
          if (si) {
            re[k] = Ti.Num.precise(v, this.precision)
          }
        })
      }
      // Done
      return re
    },
    //---------------------------------------------------
    tryEvalMyVal(newVal, oldVal) {
      if (Ti.Util.isNil(oldVal) || !_.isEqual(newVal, oldVal)) {
        this.myValue = this.evalMyVal(this.value)
      }
    },
    //---------------------------------------------------
    notifyChange() {
      let fn = ({
        "Number": () => {
          let si = _.first(this.StackItems)
          return Ti.Util.fallback(this.myValue[si.name], si.dft)
        },
        "Array": () => {
          let vs = []
          _.forEach(this.StackItems, ({ name, dft }) => {
            let v = Ti.Util.fallback(this.myValue[name], dft)
            vs.push(v)
          })
          return vs
        },
        "Object": () => {
          let re = {}
          _.forEach(this.StackItems, ({ name, dft }) => {
            let v = Ti.Util.fallback(this.myValue[name], dft)
            re[name] = v
          })
          return re;
        }
      })[this.TheValueType]
      let v = fn()
      this.$notify("change", v)
    }
    //---------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "value": {
      handler: "tryEvalMyVal",
      immediate: true
    },
    "stacks": {
      handler: "tryEvalMyVal",
      immediate: true
    }
  },
  ///////////////////////////////////////////////////////
  mounted: function () {
    Ti.Viewport.watch(this, {
      resize: () => {
        this.OnResize()
      }
    })
    this.OnResize()
  },
  ///////////////////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////////////////////////
}