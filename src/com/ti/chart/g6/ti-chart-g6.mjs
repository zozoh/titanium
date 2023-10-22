export default {
  /////////////////////////////////////////
  props: {
    "data": {
      type: [Array, Object],
      default: () => []
    },
    // Function(chart, data):void
    "redraw": {
      type: Function,
      default: _.identity
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      });
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    redrawChart() {
      this.redraw(this.data, { $con: this.$refs.chart, G6 });
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "data": "redrawChart"
  },
  //////////////////////////////////////////
  mounted: function () {
    this.redrawChart();
  },
  //////////////////////////////////////////
  beforeDestroy: function () {}
  //////////////////////////////////////////
};
