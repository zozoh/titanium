/////////////////////////////////////////////////////////
const DFT_BG = ["#08F", "#080", "#F80", "#AA0", "#0AA", "#A0A"]
/////////////////////////////////////////////////////////
export default {
  ///////////////////////////////////////////////////////
  data: () => ({
    myRect: null,
    myValue: null
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

  },
  ///////////////////////////////////////////////////////
  computed: {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass(`is-mode-${this.mode}`)
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
        let dft = Ti.Util.fallback(li.dft, max)
        let background = li.background
        if (!background) {
          background = Ti.Util.nth(DFT_BG, index, "#000")
        }
        items.push({
          title: li.title,
          index, name, min, max, dft,
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
        let val = this.myValue[name]
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
      let v0 = v * 1
      console.log(si)
      if(isNaN(v0)) {
        return
      }
      let v1 = Ti.Num.precise(v0, this.precision)
      let v2 = _.clamp(v1, si.min, si.max)
      let newVal = _.cloneDeep(this.myValue)
      newVal[name] = v2
      this.myValue = this.evalMyVal(newVal)

      this.notifyChange()
    },
    //---------------------------------------------------
    // make val to {V0: v ...}
    evalMyVal(val) {
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
      // If defined the capacity, fit it
      if (this.capacity > 0) {
        // Get the total
        let total = 0;
        _.forEach(re, v => total += v)
        // Percent 
        let percents = []
        _.forEach(this.StackItems, ({ name }) => {
          let v = re[name]
          let p = v / total
          percents.push(p)
        })
        
        // Reset the value by percents
        let vals = []
        _.forEach(this.StackItems, ({ name, index, min, max }) => {
          let p = percents[index]
          let v = p * this.capacity
          let v1 = _.clamp(v, min, max)
          let v2 = Ti.Num.precise(v1, this.precision)
          re[name] = v2
          vals.push(v2)
        })

        // Pad to capacity
        let sum = _.sum(vals)
        let mod = this.capacity - sum
        let firstName = _.first(this.StackItems).name
        re[firstName] = re[firstName] + mod
      }

      // Done
      return re
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
      handler: function (newVal, oldVal) {
        if (Ti.Util.isNil(oldVal) || !_.isEqual(newVal, oldVal)) {
          this.myValue = this.evalMyVal(newVal)
        }
      },
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