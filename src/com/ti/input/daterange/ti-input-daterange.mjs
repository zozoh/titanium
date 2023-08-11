const _M = {
  ////////////////////////////////////////////////////
  data: () => ({
    "runtime": null,
    "status": "collapse"
  }),
  ////////////////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value": {
      type: [String, Number, Date, Array],
      default: null
    },
    "valueType": {
      type: String,
      default: "ms-range",
      validator: (v) =>
        /^(ms-(array|range)|ds-(array|range)|date-array)$/.test(v)
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "canInput": {
      type: Boolean,
      default: true
    },
    "matrixCount": {
      type: Number,
      default: 2
    },
    "monthFormat": {
      type: String,
      default: "yyyy-MM-dd"
    },
    "beginYear": {
      type: [Number, String],
      default: 1970
    },
    "endYear": {
      type: [Number, String],
      default: new Date().getFullYear() + 1
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------

    "icon": {
      type: String,
      default: "fas-calendar-alt"
    },
    "format": {
      type: String,
      default: "yyyy-MM-dd HH:mm:ss"
    },
    "placeholder": {
      type: String,
      default: "i18n:blank-date-range"
    },
    "hideBorder": {
      type: Boolean,
      default: false
    },
    "statusIcons": {
      type: Object,
      default: () => ({
        collapse: "zmdi-chevron-down",
        extended: "zmdi-chevron-up"
      })
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "width": {
      type: [Number, String],
      default: "3rem"
    },
    "height": {
      type: [Number, String],
      default: undefined
    },
    "dropWidth": {
      type: [Number, String],
      default: null
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className);
    },
    //------------------------------------------------
    isCollapse() {
      return "collapse" == this.status;
    },
    isExtended() {
      return "extended" == this.status;
    },
    //--------------------------------------
    theValue() {
      if (_.isEmpty(this.value)) {
        return null;
      }
      if (_.isString(this.value)) {
        let str = _.trim(this.value);
        let m = /^[[(](.+)[\])]$/.exec(str);
        if (m) {
          str = _.trim(m[1]);
        }
        let ss = Ti.S.toArray(str, { sep: "," });
        if (ss.length > 0) {
          return Ti.Types.toDate(ss);
        }
        return Ti.Types.toDate(str);
      }
      return Ti.Types.toDate(this.value);
    },
    //--------------------------------------
    theDate() {
      if (_.isArray(this.theValue) && !_.isEmpty(this.theValue)) {
        return Ti.Types.toDate(this.theValue[0]);
      }
      if (this.theValue) {
        return Ti.Types.toDate(this.theValue);
      }
    },
    //--------------------------------------
    theRangeInMs() {
      if (!this.theDate) {
        return [];
      }
      // Move to 00:00:00
      let dt0 = new Date(this.theDate);
      // Define the dt1
      let dt1;
      if (_.isArray(this.theValue) && this.theValue.length > 1) {
        dt1 = Ti.Types.toDate(this.theValue[1]);
      }
      // The End of the Day
      else {
        dt1 = new Date(dt0);
      }
      // Make the range
      let msRange = [dt0.getTime(), dt1.getTime()].sort();

      // dt0 start of the day
      dt0 = Ti.DateTime.setTime(new Date(msRange[0]));
      // dt1 end of the day
      dt1 = Ti.DateTime.setDayLastTime(new Date(msRange[1]));

      // rebuild the range
      return [dt0.getTime(), dt1.getTime()];
    },
    //------------------------------------------------
    theRange() {
      if (_.isEmpty(this.theRangeInMs)) {
        return [];
      }
      return [new Date(this.theRangeInMs[0]), new Date(this.theRangeInMs[1])];
    },
    //------------------------------------------------
    theDropRange() {
      return this.runtime || this.theRange;
    },
    //------------------------------------------------
    theRangeValue() {
      return this.formatRangeValue(this.theRange, {
        valueType: "ds-array",
        format: "yyyy-MM-dd",
        collapse: true
      }).join(", ");
    },
    //------------------------------------------------
    theRangeText() {
      if (!_.isEmpty(this.theRange)) {
        let dt0 = this.theRange[0];
        let dt1 = this.theRange[1];
        let yy0 = dt0.getFullYear();
        let MM0 = dt0.getMonth();
        let dd0 = dt0.getDate();
        let yy1 = dt1.getFullYear();
        let MM1 = dt1.getMonth();
        let dd1 = dt1.getDate();
        let MA0 = Ti.DateTime.getMonthAbbr(MM0);
        let MA1 = Ti.DateTime.getMonthAbbr(MM1);
        let MT0 = Ti.I18n.get(MA0);
        let MT1 = Ti.I18n.get(MA1);

        MM0++;
        MM1++; // Month change to 1 base

        let vars = {
          yy0,
          yy1,
          MM0,
          MM1,
          dd0,
          dd1,
          MA0,
          MA1,
          MT0,
          MT1
        };
        // Beyond year
        if (yy0 != yy1) {
          return Ti.I18n.getf("cal.d-range-beyond-years", vars);
        }
        // Beyond month
        if (MM0 != MM1) {
          return Ti.I18n.getf("cal.d-range-beyond-months", vars);
        }
        // Beyond day
        if (dd0 != dd1) {
          return Ti.I18n.getf("cal.d-range-beyond-days", vars);
        }
        // Same day
        return Ti.I18n.getf("cal.d-range-in-same-day", vars);
      }
    },
    //------------------------------------------------
    theInputValue() {
      if (this.isExtended) {
        return this.theRangeValue;
      }
      return this.theRangeText;
    },
    //------------------------------------------------
    theStatusIcon() {
      return this.statusIcons[this.status];
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    applyRuntime() {
      if (this.runtime) {
        let rg = this.runtime;
        this.runtime = null;
        let rg2 = this.formatRangeValue(rg);
        this.$notify("change", rg2);
      }
    },
    //-----------------------------------------------
    doExtend() {
      this.status = "extended";
    },
    //-----------------------------------------------
    doCollapse({ escaped = false } = {}) {
      this.status = "collapse";
      // Drop runtime
      if (escaped) {
        this.runtime = null;
      }
      // Apply Changed for runtime
      else {
        this.applyRuntime();
      }
    },
    //------------------------------------------------
    onInputFocused() {
      this.doExtend();
    },
    //------------------------------------------------
    OnRangeBeginChange(dBegin){

    },
    //------------------------------------------------
    OnRangeEndChange(dEnd){
      console.log(dEnd)
    },
    //------------------------------------------------
    OnInputChange(val) {
      console.log("onChanged", val);
      let rg = this.parseDateRange(val);
      // Empty Range
      if (_.isEmpty(rg)) {
        this.$notify("change", null);
      }
      // Format the Range
      else {
        let rg2 = this.formatRangeValue(rg);
        this.$notify("change", rg2);
      }
    },
    //------------------------------------------------
    onClickStatusIcon() {
      // extended -> collapse
      if (this.isExtended) {
        this.doCollapse();
      }
      // collapse -> extended
      else {
        this.doExtend();
      }
    },
    //------------------------------------------------
    onDateRangeChanged(rg) {
      this.runtime = rg;
    },
    //------------------------------------------------
    parseDateRange(val) {
      console.log("parseDateRange", val);
      // Empty value as null
      if (_.isEmpty(val)) {
        return [];
      }
      // Parsed value
      let ss = val.split(",");
      // Empty
      if (_.isEmpty(ss)) {
        return [];
      }
      // One date
      if (ss.length == 1) {
        let dt0 = Ti.Types.toDate(ss[0]);
        Ti.DateTime.setTime(dt0);
        let dt1 = new Date(dt0.getTime());
        Ti.DateTime.setDayLastTime(dt1);
        return [dt0, dt1];
      }
      // range
      let dt0 = Ti.Types.toDate(ss[0]);
      Ti.DateTime.setTime(dt0);
      let dt1 = Ti.Types.toDate(ss[1]);
      Ti.DateTime.setDayLastTime(dt1);
      return [dt0, dt1].sort((dt0, dt1) => {
        return dt0.getTime() - dt1.getTime();
      });
    },
    //------------------------------------------------
    formatRangeValue(range, { valueType, format, collapse = false } = {}) {
      //console.log("formatRangeValue", range)
      let [d0, d1] = range || [];
      if (!d0) {
        return [];
      }
      if (!d1) {
        d1 = new Date(d0);
      }
      // Padding date
      Ti.DateTime.setTime(d0);
      Ti.DateTime.setDayLastTime(d1);
      // Check the value type
      valueType = valueType || this.valueType;
      format = format || this.format;
      // as range
      let func = {
        "ms-range": () => {
          return `[${d0.getTime()},${d1.getTime()}]`;
        },
        "ms-array": () => {
          return [d0.getTime(), d1.getTime()];
        },
        "ds-range": () => {
          return (
            "[" +
            [
              Ti.Types.formatDate(d0, format),
              Ti.Types.formatDate(d1, format)
            ].join(",") +
            "]"
          );
        },
        "ds-array": () => [
          Ti.Types.formatDate(d0, format),
          Ti.Types.formatDate(d1, format)
        ],
        "date-array": () => [d0, d1]
      }[valueType];
      // As array
      let re = func();

      if (collapse) {
        if (re[0] == re[1]) return [re[0]];
      }
      return re;
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
};
export default _M;
