export default {
  /////////////////////////////////////////
  data: () => ({
    myBlockAreas: [],
    myWatchAreas: [
      /*{index, type:"row|column", rect}*/
    ],
    myView: undefined, // Rect
    myGrid: {
      /*columns,rows,lineV,lineH */
    },
    myCustomizedTracks: {
      /*columns:[...],
      rows:[...]*/
    }
  }),
  /////////////////////////////////////////
  props: {
    "adjustMode": {
      type: String,
      default: "none",
      validator: (v) => /^(none|both|column|row)$/.test(v)
    },
    "grid": {
      type: Object
    },
    "lineRadius": {
      type: Number,
      default: 4
    },
    "cellMinWidth": {
      type: Number,
      default: 50
    },
    "cellMinHeight": {
      type: Number,
      default: 50
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopStyle() {
      let re = {
        display: "grid"
      };
      _.forEach(this.grid, (val, key) => {
        let k = _.kebabCase(key);
        re[k] = val;
      });
      if (this.border) {
        _.defaults(re, {
          "grid-gap": "1px"
        });
      }
      //
      // patch customized track columns/rows
      //
      if (this.myCustomizedTracks) {
        let { columns, rows } = this.myCustomizedTracks;
        if (!_.isEmpty(columns)) {
          re["grid-template-columns"] = columns.join(" ");
        }
        if (!_.isEmpty(rows)) {
          re["grid-template-rows"] = rows.join(" ");
        }
      }
      //
      // patch columns/rows setting during dragging
      //
      if (this.isDragging && this.myTrackScales) {
        let cssProp = {
          column: "grid-template-columns",
          row: "grid-template-rows"
        }[this.myDragArea.type];

        // auto 有毒， 还是不要这么搞了，这个逻辑没用了应该
        // let autoIxs = {
        //   column: this.AutoColTrackIndexes,
        //   row: this.AutoRowTrackIndexes
        // }[this.myDragArea.type];

        let scales = _.map(this.myTrackScales, (v, index) => {
          // if (_.indexOf(autoIxs, index) >= 0) {
          //   return "auto";
          // }
          return v;
        });
        re[cssProp] = scales.join(" ");
      }
      return re;
    }
    //--------------------------------------
    // auto 有毒， 还是不要这么搞了，这两个函数没用了应该
    // AutoColTrackIndexes() {
    //   return this.getAutoTrackIndexes(
    //     _.get(this.grid, "grid-template-columns")
    //   );
    // },
    //--------------------------------------
    // AutoRowTrackIndexes() {
    //   return this.getAutoTrackIndexes(_.get(this.grid, "grid-template-rows"));
    // }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnResize() {
      this.debounceEvalGridMeasure();
    },
    //--------------------------------------
    OnResetTracks() {
      this.LOG("OnResetTracks");
      this.clearDragging();
      Ti.Viewport.resize();
      this.myCustomizedTracks = {};
      this.trySaveLocalCustomized();
    },
    //--------------------------------------
    clearDragging() {
      this.isDragging = false;
      this.myDragX = undefined;
      this.myDragY = undefined;
      this.myDragArea = undefined;
      this.myTrackScales = undefined;
    },
    //--------------------------------------
    drawWatchingArea() {
      _.forEach(this.myWatchAreas, ({ type, rect }) => {
        Ti.Dom.createElement({
          $p: this.$el,
          style: _.assign(
            {
              position: "fixed",
              backgroundColor: {
                column: "#F00",
                row: "#00F"
              }[type]
            },
            rect.toCss()
          )
        });
      });

      _.forEach(this.myBlockAreas, ({ rect }) => {
        Ti.Dom.createElement({
          $p: this.$el,
          style: _.assign(
            {
              position: "fixed",
              backgroundColor: "rgba(255,255,0,0.3)"
            },
            rect.toCss()
          )
        });
      });
    },
    //--------------------------------------
    getAutoTrackIndexes(track) {
      let re = [];
      if (_.isString(track)) {
        let ss = Ti.S.splitIgnoreBlank(track, /\s+/g);
        for (let i = 0; i < ss.length; i++) {
          if (/^auto$/i.test(ss[i])) {
            re.push(i);
          }
        }
      }
      return re;
    },
    //--------------------------------------
    evalGridMeasure() {
      this.LOG("evalGridMeasure", this.$el);
      let $blocks = Ti.Dom.findAll(":scope > main> .ti-gui-block", this.$el);

      // Guard
      if (_.isEmpty($blocks)) {
        this.LOG("No blocks found");
        return;
      }

      let N = $blocks.length;
      this.LOG(`Loop ${N} blocks`);

      //
      // Collect each row and column top/bottom, left/right
      //
      let MEA = {
        view: Ti.Rects.createBy(this.$el),
        tops: [],
        bottoms: [],
        lefts: [],
        rights: [],
        //.............................................
        push: function (rect = {}) {
          //rect.relative(this.view);
          let { left, right, top, bottom } = rect;

          this.tops.push(Math.round(top));
          this.lefts.push(Math.round(left));
          this.rights.push(Math.round(right));
          this.bottoms.push(Math.round(bottom));
        },
        //.............................................
        uniquely: function () {
          const _uniq_sort = (list) => {
            return _.uniq(_.clone(list)).sort((a, b) => a - b);
          };
          this.tops = _uniq_sort(this.tops);
          this.lefts = _uniq_sort(this.lefts);
          this.rights = _uniq_sort(this.rights);
          this.bottoms = _uniq_sort(this.bottoms);
          if (this.tops.length != this.bottoms.length) {
            console.error(_.pick(this, "tops", "bottoms"));
            throw `Unmatched row top/bottom`;
          }
          if (this.lefts.length != this.rights.length) {
            console.error(_.pick(this, "lefts", "rights"));
            throw `Unmatched column left/right`;
          }
        },
        //.............................................
        /*
        return {
          columns: [{left,right}],
          rows: [{top,bottom}],
          lineV : [N,..],
          lineH : [N,..]
        }
        */
        toGrid: function () {
          let columns = [];
          let rows = [];

          for (let i = 0; i < this.lefts.length; i++) {
            columns.push({
              left: this.lefts[i],
              right: this.rights[i]
            });
          }

          for (let i = 0; i < this.tops.length; i++) {
            rows.push({
              top: this.tops[i],
              bottom: this.bottoms[i]
            });
          }

          let lineV = [];
          let lineH = [];

          for (let i = 1; i < columns.length; i++) {
            let col0 = columns[i - 1];
            let col1 = columns[i];
            lineV.push(Math.round(col0.right + (col1.left - col0.right) / 2));
          }

          for (let i = 1; i < rows.length; i++) {
            let row0 = rows[i - 1];
            let row1 = rows[i];
            lineH.push(Math.round(row0.bottom + (row1.top - row0.bottom) / 2));
          }

          return { columns, rows, lineV, lineH };
        },
        //.............................................
        getWatchAreas(radius = 5, grid) {
          if (!grid) {
            grid = this.toGrid();
          }
          let { top, bottom, left, right } = this.view;
          let areas = [];
          let { lineH, lineV } = grid;
          //
          // Watch column border(vertical line)
          for (let i = 0; i < lineV.length; i++) {
            let v = lineV[i];
            areas.push({
              index: i,
              type: "column",
              rect: Ti.Rects.create({
                left: v - radius,
                right: v + radius,
                top,
                bottom
              })
            });
          }
          //
          // Watch column border(vertical line)
          for (let i = 0; i < lineH.length; i++) {
            let v = lineH[i];
            areas.push({
              index: i,
              type: "row",
              rect: Ti.Rects.create({
                left,
                right,
                top: v - radius,
                bottom: v + radius
              })
            });
          }

          return areas;
        },
        //.............................................
        toGridString(grid) {
          if (!grid) {
            grid = this.toGrid();
          }
          let ss = ["COLs:"];
          ss[1] = _.map(grid.columns, ({ left, right }, I) => {
            let s = `${I}:${left}-${right}`;
            if (I < grid.lineV.length) {
              s += ` |<${grid.lineV[I]}>|`;
            }
            return s;
          }).join(" ");
          ss[2] = "ROWs:";
          ss[3] = _.map(grid.rows, ({ top, bottom }, I) => {
            let s = `${I}:${top}-${bottom}`;
            if (I < grid.lineH.length) {
              s += ` |<${grid.lineH[I]}>|`;
            }
            return s;
          }).join(" ");
          return ss.join("\n");
        }
        //.............................................
      }; // ~ MEA

      // Collection each block
      let blockAreas = [];
      for (let i = 0; i < N; i++) {
        let $B = $blocks[i];

        // Join block the measure, to eval the watching area
        // to show the adjust bar
        let R = Ti.Rects.createBy($B);
        MEA.push(R);

        // Add block rect to list , when mouse move in it
        // will not show the adjust bar,
        // in case one block span 2 row/cols ,
        let bR = R.clone();
        bR.width = bR.width - this.lineRadius * 2;
        bR.height = bR.height - this.lineRadius * 2;

        blockAreas.push({
          index: i,
          rect: bR.update("xywh")
        });
        this.LOG(`${i}) ${R.toString()}`);
      }
      MEA.uniquely();
      this.LOG(_.pick(MEA, "tops", "bottoms", "lefts", "rights"));
      let grid = MEA.toGrid();
      this.LOG(MEA.toGridString(grid));

      let watchAreas = MEA.getWatchAreas(this.lineRadius);
      this.LOG("Watch Areas:", watchAreas);

      this.myGrid = grid;
      this.myView = MEA.view;
      this.myBlockAreas = blockAreas;
      this.myWatchAreas = watchAreas;

      //this.drawWatchingArea();
    },
    //--------------------------------------
    tryEvalGridMeasure() {
      console.log("tryEvalGridMeasure");
      // Guard
      if (!_.isElement(this.$el)) {
        return;
      }
      this.LOG("delay call evalGridMeasure");
      _.delay(() => {
        this.evalGridMeasure();
      }, 200);
    },
    //--------------------------------------
    trySaveLocalCustomized() {
      if (this.keepCustomizedTo) {
        let tracks = _.isEmpty(this.myCustomizedTracks)
          ? null
          : this.myCustomizedTracks;
        Ti.Storage.local.setObject(this.keepCustomizedTo, tracks);
      }
    },
    //--------------------------------------
    tryRestoreLocalCustomized() {
      if (this.keepCustomizedTo) {
        let tracks = Ti.Storage.local.getObject(this.keepCustomizedTo);
        if (!_.isEmpty(tracks)) {
          this.myCustomizedTracks = tracks;
        }
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "GuiBlocks": "tryEvalGridMeasure"
  },
  //////////////////////////////////////////
  created: function () {
    this.debounceEvalGridMeasure = _.debounce(() => {
      this.tryEvalGridMeasure();
    }, 500);
    this.LOG = () => {};
    this.LOG = console.log;
  },
  //////////////////////////////////////////
  mounted: function () {
    Ti.Viewport.watch(this, {
      resize: () => {
        this.OnResize();
      }
    });
    this.tryEvalGridMeasure();
    this.tryRestoreLocalCustomized();
  },
  ///////////////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Viewport.unwatch(this);
  }
  //////////////////////////////////////////
};
