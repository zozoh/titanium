const _M = {
  ////////////////////////////////////////////////////
  data: () => ({
    box: {
      "position": null,
      "width": null,
      "height": null,
      "top": null,
      "left": null
    },
    myDropDockReady: false
  }),
  ////////////////////////////////////////////////////
  props: {
    "keepWidthWhenDrop": {
      type: Boolean,
      default: true
    },
    "width": {
      type: [Number, String],
      default: null
    },
    "height": {
      type: [Number, String],
      default: null
    },
    "dropFloat": {
      type: Boolean,
      default: true
    },
    "dropWidth": {
      type: [Number, String],
      default: "box"
    },
    "dropHeight": {
      type: [Number, String],
      default: null
    },
    "dropOverflow": {
      type: [String, Array],
      default: "auto",
      validator: (v) => {
        if (Ti.Util.isNil(v)) {
          return true;
        }
        if (_.isString(v)) {
          v = v.split(" ");
        }
        if (_.isArray(v)) {
          if (v.length > 2 || v.length == 0) {
            return false;
          }
          for (let s of v) {
            if (!/^(auto|hidden|visible|scroll)$/.test(s)) {
              return false;
            }
          }
          return true;
        }
        return false;
      }
    },
    "status": {
      type: String,
      default: "collapse",
      validator: (st) => /^(collapse|extended)$/.test(st)
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    topClass() {
      return this.getTopClass(`is-${this.status}`);
    },
    //------------------------------------------------
    topStyle() {
      let width;
      if (this.keepWidthWhenDrop)
        width = Ti.Util.fallback(this.box.width, this.width);
      let height = this.box.height;
      if (width || height) {
        return Ti.Css.toStyle({
          width,
          height,
          flex: "0 0 auto"
        });
      }
    },
    //------------------------------------------------
    theBoxStyle() {
      if (this.dropFloat) {
        return Ti.Css.toStyle(this.box);
      }
    },
    //------------------------------------------------
    theDropStyle() {
      return Ti.Css.toStyle({
        "overflow": this.dropOverflow,
        "visibility": this.myDropDockReady ? "visible" : "hidden"
      });
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    notifyCollapse(escaped = false) {
      if ("collapse" != this.status) {
        this.$notify("collapse", { escaped });
      }
    },
    //------------------------------------------------
    dockDrop() {
      let $drop = this.$refs.drop;
      let $box = this.$refs.box;
      // Guard the elements
      if (!_.isElement($drop) || !_.isElement($box)) {
        return;
      }
      //............................................
      // If drop opened, make the box position fixed
      // to at the top of mask
      if ("extended" == this.status) {
        // Wait 1ms for drop content done for drawing
        _.delay(() => {
          let r_box = Ti.Rects.createBy($box);
          let r_drop = Ti.Rects.createBy($drop);
          //..........................................
          // Mark box to fixed position
          this.box = _.assign({ position: "fixed" }, r_box.raw());
          //..........................................
          // Make drop same width with box
          let dropStyle = {};
          if ("box" == this.dropWidth) {
            dropStyle.width = Math.max(r_box.width, r_drop.width);
          } else if (!Ti.Util.isNil(this.dropWidth)) {
            // The min drop width
            if (this.dropWidth < 0) {
              dropStyle.width = Math.max(r_box.width, Math.abs(this.dropWidth));
            }
            // Fix drop width
            else {
              dropStyle.width = this.dropWidth;
            }
          }
          if (!Ti.Util.isNil(this.dropHeight)) {
            dropStyle.height = this.dropHeight;
          }
          //..........................................S
          Ti.Dom.updateStyle($drop, Ti.Css.toStyle(dropStyle));
          //..........................................
          // Dock drop to box
          Ti.Dom.dockTo($drop, $box, {
            space: { y: 2 }
          });
          // Make drop visible
          _.delay(() => {
            this.myDropDockReady = true;
          }, 1);
        }, 1);
        //..........................................
      }
      //............................................
    },
    //------------------------------------------------
    reDockDrop() {
      this.resetBoxStyle();
      this.$nextTick(() => {
        this.dockDrop();
      });
    },
    //------------------------------------------------
    resetBoxStyle() {
      // Recover the $box width/height
      this.box = {};
      this.myDropDockReady = false;
    },
    //------------------------------------------------
    __ti_shortcut(uniqKey) {
      if ("ESCAPE" == uniqKey) {
        this.notifyCollapse(true);
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "status": function (sta) {
      this.$nextTick(() => {
        // If collapse, it should clean the box styles
        if ("collapse" == sta) {
          this.resetBoxStyle();
        }
        // try docking
        else {
          this.dockDrop();
        }
      });
    }
  },
  ////////////////////////////////////////////////////
  mounted: function () {
    this.dropOpened = this.autoOpenDrop;
    this.box.width = this.width;
    this.box.height = this.height;

    this.dockDrop();

    Ti.Viewport.watch(this, {
      scroll: () => this.notifyCollapse(),
      resize: () => this.notifyCollapse()
    });
  },
  ////////////////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Viewport.unwatch(this);
  }
  ////////////////////////////////////////////////////
};
export default _M;
