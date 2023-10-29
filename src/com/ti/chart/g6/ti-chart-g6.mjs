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
    redrawChart({ force = false, firstTime } = {}) {
      this.$graph = this.redraw(this.data, {
        $con: this.$refs.chart,
        G6,
        force,
        firstTime
      });
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "data": "redrawChart"
  },
  ////////////////////////////////////////////////////
  created: function () {
    this._debounce_redraw = _.debounce(() => {
      let { $graph } = this;
      if (this.$graph) {
        $graph.destroy();
        this.$graph = undefined;
        this.redrawChart({ force: true, firstTime: false });
      }
    }, 500);
  },
  //////////////////////////////////////////
  mounted: function () {
    this.redrawChart();
    Ti.Viewport.watch(this, {
      resize: () => {
        this._debounce_redraw();
      }
    });
  },
  //////////////////////////////////////////
  beforeDestroy: function () {
    if (this.$graph) {
      this.$graph.destroy();
    }
    Ti.Viewport.unwatch(this);
  }
  //////////////////////////////////////////
};
