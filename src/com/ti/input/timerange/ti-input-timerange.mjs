const _M = {
  ////////////////////////////////////////////////////
  data : ()=>({
    "runtime" : null,
    "status"  : "collapse"
  }),
  ////////////////////////////////////////////////////
  props : {
    "canInput" : {
      type : Boolean,
      default : true
    },
    "value" : {
      type : [String, Object, Number, Array],
      default : null
    },
    "rangeKeys" : {
      type : Array,
      default : ()=>["beginTime", "endTime"]
    },
    // TODO only str-array supported now
    // please fix it refer by ti-input-daterange.mjs
    "valueType" : {
      type : String,
      default : "str-array",
      validator: v => /^((str|ms|sec)-(array|obj))$/.test(v)
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
      default : "HH:mm"
    },
    "placeholder" : {
      type : String,
      default : "i18n:blank-time-range"
    },
    "hideBorder" : {
      type : Boolean,
      default : false
    },
    "width" : {
      type : [Number, String],
      default : "2rem"
    },
    "height" : {
      type : [Number, String],
      default : undefined
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.status},
    isExtended() {return "extended"==this.status},
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
        // Time
        if(val) {
          ss.push(val.toString(this.format))
        }
        // Zero
        else {
          ss.push(Ti.Types.formatTime(0, this.format))
        }
      })
      return ss.join(" ~ ")
    },
    //--------------------------------------
    theRangeValue() {
      return this.formatRangeValue(this.theRange)
    },
    //------------------------------------------------
    theDropRange() {
      return this.runtime || this.theRangeValue
    },
    //------------------------------------------------
    theStatusIcon() {
      return this.statusIcons[this.status]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    applyRuntime() {
      if(this.runtime) {
        console.log("hah")
        let rg = this.parseTimeRange(this.runtime)
        this.runtime = null
        let rg2 = this.formatRangeValue(rg)
        let rg3 = this.formatEmitRangeValue(rg2)
        this.$notify("change", rg3)
      }
    },
    //-----------------------------------------------
    doExtend() {
      this.status = "extended"
    },
    //-----------------------------------------------
    doCollapse({escaped=false}={}) {
      this.status = "collapse"
      // Drop runtime
      if(escaped) {
        this.runtime = null
      }
      // Apply Changed for runtime
      else {
        this.applyRuntime()
      }
    },
    //------------------------------------------------
    onInputFocused() {
      this.doExtend()
    },
    //------------------------------------------------
    onChanged(val) {
      let rg = this.parseTimeRange(val)
      // Empty Range
      if(_.isEmpty(rg)) {
        this.$notify("change", null);
      }
      // Format the Range
      else {
        let rg2 = this.formatRangeValue(rg)
        let rg3 = this.formatEmitRangeValue(rg2)
        this.$notify("change", rg3);
      }
    },
    //------------------------------------------------
    onClickStatusIcon() {
      // extended -> collapse
      if(this.isExtended) {
        this.doCollapse()
      }
      // collapse -> extended
      else {
        this.doExtend()
      }
    },
    //------------------------------------------------
    formatEmitRangeValue(rg) {
      let [keyBegin, keyEnd] = this.rangeKeys
      // Format the value to array
      if(rg && "Array" == this.valueType) {
        let re = [rg[keyBegin], rg[keyEnd]]
        return _.filter(re, (v)=>(v && _.isString(v)))
      }
      // Default as object
      return rg
    },
    //------------------------------------------------
    onFormChanged(payload) {
      this.runtime = _.cloneDeep(payload)
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
      if(rg && (rg[keyBegin] || rg[keyEnd]) ) {
        if(!rg[keyBegin]) {
          let tBegin = Ti.Types.toTime(0)
          rg[keyBegin] = tBegin.toString()
        }
        if(!rg[keyEnd]) {
          let tEnd = Ti.Types.toTime(86400000-1)
          rg[keyEnd] = tEnd.toString()
        }
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
        // Time
        if(val) {
          rg[key] = val.toString()
        }
        // Zero
        else {
          rg[key] = Ti.Types.formatTime(0)
        }
      })
      return rg
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}
export default _M;