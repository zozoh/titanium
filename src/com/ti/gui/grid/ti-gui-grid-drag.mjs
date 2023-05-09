export default {
  /////////////////////////////////////////
  data: () => ({
    myDragArea: undefined,
    myDragX: undefined,
    myDragY: undefined,
    myTrackScales: undefined
  }),
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    isShowDragBar() {
      return this.myDragArea ? true : false;
    },
    //--------------------------------------
    DragBarClass() {
      if (this.myDragArea) {
        return `as-${this.myDragArea.type}`;
      }
    },
    //--------------------------------------
    DragBarStyle() {
      if (this.myDragArea) {
        let rect = this.myDragArea.rect.clone();
        let view = this.myView;
        // console.log(rect);
        // console.log(view);
        rect.relative(view);
        let css = rect.toCss(view);
        if (this.isDragging) {
          // Drag in X-axis
          if (_.isNumber(this.myDragX)) {
            css.left = `${this.myDragX - this.lineRadius}px`;
          }
          // Drag in Y-axis
          else if (_.isNumber(this.myDragY)) {
            css.top = `${this.myDragY - this.lineRadius}px`;
          }
        }
        return Ti.Css.toStyle(css);
      }
    },
    //--------------------------------------
    GridDraggable() {
      //....................................
      const do_dragging = (ctx) => {
        let {
          viewWidth,
          trackSizes,
          dragScope,
          minSize,
          sumSize,
          lineI,
          gapRadius,
          padHead,
          padTail
        } = ctx;
        // x-column(left/right), y-row(top/bottom)
        let k = ctx.axisMode;
        let v = ctx[k];
        /*
         Eval the track size:
                   +--- mouse X/Y
                   V
         | [...]   |  [...]   |
          ^      ^          ^
          |      |          +-- pad Tail
          |      +-- garRadius  
          +-- padHead         
        */
        let [MIN, MAX] = dragScope;
        let v2 = _.clamp(v, MIN + minSize, MAX - minSize);
        // Move the bar in-time
        this[ctx.propKey] = v2; // myDragX/Y

        // Calculate the track size
        let prev = v2 - MIN - gapRadius;
        let next = MAX - v2 - gapRadius;
        trackSizes[lineI] = prev;
        trackSizes[lineI + 1] = next;

        // Calculate the scale
        let scales = [];
        for (let sz of trackSizes) {
          let s = sz / viewWidth;
          let p = Ti.S.toPercent(s);
          scales.push(p);
          //scales.push(`${sz}px`);
        }

        this.LOG(
          ` I=${lineI} ${k}=${v}/${v2} GapR=${gapRadius}, pad=${padHead}:${padTail}`,
          `sum=${sumSize}, scope=${JSON.stringify(dragScope)}`,
          trackSizes,
          `=${_.sum(trackSizes)}`,
          scales
        );
        this.myTrackScales = scales;
      };
      //....................................
      return {
        trigger: ".ti-gui-grid-drag-bar",
        prepare: (ctx, evt) => {
          this.isDragging = true;
          let mk = Ti.Dom.hasClass(ctx.$trigger, "as-column") ? "x" : "y";
          ctx.axisMode = mk;
          ctx.propKey = `myDrag${_.upperCase(mk)}`;
          let minSize = {
            x: this.cellMinWidth,
            y: this.cellMinHeight
          }[mk];

          let I = this.myDragArea.index;
          // Get the left/right top/bottom key of track
          let K0 = { x: "left", y: "top" }[mk];
          let K1 = { x: "right", y: "bottom" }[mk];

          // Get the track columns/rows
          let tracks = this.myGrid[{ x: "columns", y: "rows" }[mk]];
          let tk0 = tracks[I];
          let tk1 = tracks[I + 1];

          // Get mouse move scope (relative the viewport)
          let dragScope = [
            tk0[K0] - this.myView[K0],
            tk1[K1] - this.myView[K0]
          ];

          // Eval each cell size in track
          // X-Axis: columns : left/right
          // Y-Axis: rows : top/bottom
          let trackSizes = _.map(tracks, (cell) => {
            return cell[K1] - cell[K0];
          });

          ctx.gapRadius = (tk1[K0] - tk0[K1]) / 2;
          ctx.padHead = _.first(tracks)[K0] - this.myView[K0];
          ctx.padTail = this.myView[K1] - _.last(tracks)[K1];
          ctx.trackSizes = trackSizes;
          ctx.sumSize = _.sum(trackSizes);
          ctx.dragScope = dragScope;
          ctx.minSize = minSize;
          ctx.lineI = I;
          ctx.viewWidth = ctx.sumSize + ctx.gapRadius * 2 * (tracks.length - 1);
        },
        actived: (ctx) => {
          //console.log("actived", ctx);
          // Get all my blocks and init them rect
        },
        dragging: do_dragging,
        done: (ctx) => {
          //console.log("dragging done");
          // Save customized
          let { axisMode } = ctx;
          let cuKey = {
            x: "columns",
            y: "rows"
          }[axisMode];
          let tracks = _.assign({}, this.myCustomizedTracks);
          tracks[cuKey] = _.cloneDeep(this.myTrackScales);
          this.myCustomizedTracks = tracks;
          this.trySaveLocalCustomized();
          // Notify whole window resizing
          Ti.Viewport.resize();
        },
        finished: (ctx) => {
          // Reset mark
          this.clearDragging();
        }
      };
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnMouseMove($event) {
      // If is dragging, watching mouse is unnecessary
      if (this.isDragging) {
        return;
      }

      // get mouse pointer
      let point = { x: $event.pageX, y: $event.pageY };

      // In block area will not show the adjustbar
      for (let B of this.myBlockAreas) {
        if (B.rect.hasPoint(point)) {
          return;
        }
      }

      let amode = this.adjustMode;

      // found area
      let area = _.find(this.myWatchAreas, (area) => {
        if ("both" == amode || amode == area.type) {
          return area.rect.hasPoint(point);
        }
      });

      // if (area) {
      //   this.LOG(`AREA=${area.index} : X=${pageX},Y=${pageY} : ${area.rect}`);
      // }
      // if (area)
      this.myDragArea = area;
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  mounted() {}
  //////////////////////////////////////////
};
