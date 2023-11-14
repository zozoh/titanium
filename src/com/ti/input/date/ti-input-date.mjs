const COM_TYPE = "TiInputDate";
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
      type: [String, Number, Date],
      default: null
    },
    "valueType": {
      type: String,
      default: "ds",
      validator: (v) => /^(ms|ds|date)$/.test(v)
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "canInput": {
      type: Boolean,
      default: true
    },
    "monthFormat": {
      type: String,
      default: "yyyy-MM"
    },
    "beginYear": {
      type: [Number, String],
      default: Ti.Config.getComProp(COM_TYPE, "beginYear", 1970)
    },
    "endYear": {
      type: [Number, String],
      default: Ti.Config.getComProp(
        COM_TYPE,
        "endYear",
        new Date().getFullYear() + 1
      )
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "icon": {
      type: String,
      default: "far-calendar-alt"
    },
    "format": {
      type: String,
      default: "yyyy-MM-dd"
    },
    "placeholder": {
      type: [String, Number],
      default: "i18n:blank-date"
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
    "autoCollapse": {
      type: Boolean,
      default: true
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "width": {
      type: [Number, String],
      default: "2rem"
    },
    "height": {
      type: [Number, String],
      default: undefined
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
    //------------------------------------------------
    theDate() {
      return Ti.Types.toDate(this.value, null);
    },
    //------------------------------------------------
    theDropDate() {
      return this.runtime || this.theDate;
    },
    //------------------------------------------------
    theInputValue() {
      if (this.isExtended) {
        return this.getDateText(this.theDropDate);
      }
      return this.getDateText(this.theDropDate, this.format);
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
        let dt = this.runtime;
        this.runtime = null;
        let v = this.getDateValue(dt);
        this.$notify("change", v);
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
    onChanged(val) {
      // Empty value as null
      if (_.isEmpty(val)) {
        this.$notify("change", null);
      }
      // Parsed value
      else {
        let dt = Ti.Types.toDate(val);
        let v = this.getDateValue(dt);
        this.$notify("change", v);
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
    onDateChanged(dt) {
      this.runtime = dt;
      if (this.autoCollapse) {
        this.doCollapse();
      }
    },
    //------------------------------------------------
    getDateText(dt, fmt = "yyyy-MM-dd") {
      let dt2 = Ti.Types.toDate(dt, null);
      return Ti.Types.formatDate(dt2, fmt);
    },
    //------------------------------------------------
    getDateValue(date) {
      let func = {
        "ms": (d) => d.getTime(),
        "ds": (d) => this.getDateText(d),
        "date": (d) => d
      }[this.valueType];

      // Move to 00:00:00
      Ti.DateTime.setTime(date);

      // Done
      return func(date);
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
};
export default _M;
