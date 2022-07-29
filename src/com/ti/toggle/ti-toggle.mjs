export default {
  /////////////////////////////////////////
  data: () => ({
    isOn: false
  }),
  /////////////////////////////////////////
  props: {
    "value": false,
    "readonly": false,
    "options": {
      type: Array,
      default: () => [false, true]
    }
  },
  //////////////////////////////////////////
  computed: {
    //......................................
    topClass() {
      return Ti.Css.mergeClassName({
        "is-off": !this.isOn,
        "is-on": this.isOn
      }, this.className)
    }
    //......................................
  },
  //////////////////////////////////////////
  methods: {
    onClick() {
      if (!this.readonly) {
        let v = this.isOn ? 0 : 1
        this.$notify("change", this.options[v])
      }
    }
  },
  //////////////////////////////////////////
  watch: {
    "value": function () {
      if (_.isArray(this.options) && this.options.length >= 2) {
        this.isOn = this.value === this.options[1];
      } else {
        this.isOn = this.value ? true : false
      }
    }
  },
  //////////////////////////////////////////
  mounted: function () {
    this.isOn = this.value ? true : false
  }
  //////////////////////////////////////////
}