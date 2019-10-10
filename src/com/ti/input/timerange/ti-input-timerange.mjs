export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "dropRange"   : null
  }),
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "value" : {
      type : [String, Object, Number, Array],
      default : null
    },
    "rangeKeys" : {
      type : Array,
      default : ()=>["beginTime", "endTime"]
    },
    "valueMode" : {
      type : String,
      default : "Array"
    },
    "dftValue" : {
      type : Array,
      default : ()=>["09:00", "17:00"]
    },
    "icon" : {
      type : String,
      default : "zmdi-time-interval"
    },
    "format" : {
      type : String,
      default : "yyyy-MM-dd"
    },
    "placeholder" : {
      type : String,
      default : "i18n:blank-time-range"
    },
    // true : can write time directly
    "editable" : {
      type : Boolean,
      default : true
    },
    // when "editable", it will render text by `input` element
    // This prop indicate if open drop when input was focused
    // `true` as default
    "focusToOpen" : {
      type : Boolean,
      default : true
    },
    "width" : {
      type : [Number, String],
      default : "2rem"
    },
    "height" : {
      type : [Number, String],
      default : undefined
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return this.className
    },
    //--------------------------------------
    theFormConfig() {
      let [keyBegin, keyEnd] = this.rangeKeys
      let fields = [{
        name  : keyBegin,
        type  : "Time",
        title : "i18n:time-begin",
        comType : "ti-input-time"
      }, {
        name  : keyEnd,
        type  : "Time",
        title : "i18n:time-end",
        comType : "ti-input-time"
      }]
      return {
        fields,
        spacing : "tiny",
        statusIcons : null
      }
    },
    //--------------------------------------
    theRange() {
      return this.parseTimeRange(this.value)
    },
    //--------------------------------------
    theRangeText() {
      let [keyBegin, keyEnd] = this.rangeKeys
      let ss = []
      _.forEach(this.theRange, (val)=>{
        ss.push(val.toString())
      })
      return ss.join(" ~ ")
    },
    //--------------------------------------
    theRangeValue() {
      return this.formatRangeValue(this.theRange)
    },
    //------------------------------------------------
    theDropRange() {
      return this.dropRange || this.theRangeValue
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onCollapse() {
      if(this.dropRange) {
        let rg = this.parseTimeRange(this.dropRange)
        this.dropRange = null
        let rg2 = this.formatRangeValue(rg)
        let rg3 = this.formatEmitRangeValue(rg2)
        this.$emit("changed", rg3)
      }
    },
    //------------------------------------------------
    onInputChanged(val) {
      let rg = this.parseTimeRange(val)
      // Empty Range
      if(_.isEmpty(rg)) {
        this.$emit("changed", null);
      }
      // Format the Range
      else {
        let rg2 = this.formatRangeValue(rg)
        let rg3 = this.formatEmitRangeValue(rg2)
        this.$emit("changed", rg3);
      }
    },
    //------------------------------------------------
    formatEmitRangeValue(rg) {
      let [keyBegin, keyEnd] = this.rangeKeys
      // Format the value to array
      if(rg && "Array" == this.valueMode) {
        let re = [rg[keyBegin], rg[keyEnd]]
        return _.filter(re, (v)=>(v && _.isString(v)))
      }
      // Default as object
      return rg
    },
    //------------------------------------------------
    onFormChanged(pair) {
      let rg = _.assign({}, this.theRangeValue, this.dropRange)
      rg[pair.name] = pair.value
      this.dropRange = rg
    },
    //------------------------------------------------
    parseTimeRange(val) {
      let [keyBegin, keyEnd] = this.rangeKeys
      val = Ti.Util.fallback(val, this.dftValue, {})
      let rg = {}
      // Number 
      if(_.isNumber(val)) {
        let tm = Ti.Types.toTime(val)
        rg = {
          [keyBegin] : tm
        }
      }
      // String
      else if(_.isString(val)) {
        let str = _.trim(val)
        let ss = _.split(str, /[\t ,\/~-]+/)
        let tm0 = Ti.Types.toTime(ss[0])
        let tm1 = Ti.Types.toTime(ss[1])
        rg = {
          [keyBegin] : tm0,
          [keyEnd]   : tm1
        }
      }
      // Array
      else if(_.isArray(val)) {
        rg = {
          [keyBegin] : Ti.Types.toTime(val[0]),
          [keyEnd]   : Ti.Types.toTime(val[1])
        }
      }
      // Plain Object
      else if(_.isPlainObject(val)) {
        rg = _.pick(val, this.rangeKeys)
      }
      // Then make sure the range beignTime is the less one
      return this.normalizeRange(rg)
    },
    //------------------------------------------------
    // Then make sure the range beignTime is the less one
    normalizeRange(rg) {
      let [keyBegin, keyEnd] = this.rangeKeys
      if(rg && rg[keyBegin] && rg[keyEnd]) {
        let tmBegin = Ti.Types.toTime(rg[keyBegin])
        let tmEnd   = Ti.Types.toTime(rg[keyEnd])
        if(tmBegin.valueInMilliseconds > tmEnd.valueInMilliseconds) {
          let tm = rg[keyBegin]
          rg[keyBegin] = tmEnd
          rg[keyEnd] = tmBegin
        }
      }
      return rg
    },
    //------------------------------------------------
    formatRangeValue(range) {
      let rg = _.assign({}, range)
      _.forEach(rg, (val, key)=>{
        rg[key] = val.toString()
      })
      return rg
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}