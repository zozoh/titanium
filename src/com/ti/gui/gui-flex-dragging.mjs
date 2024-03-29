export default {
  /////////////////////////////////////////
  data: () => ({
    blockSizes: undefined
  }),
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    Draggable() {
      //....................................
      const do_dragging = (ctx) => {
        let { orgBlockSizes, prevI, selfI } = ctx;
        let offset = ctx[this.offset_key];
        //console.log("dragging", { offset, orgBlockSizes, prevI, selfI })
        let sizes = _.cloneDeep(orgBlockSizes);

        // Block minimum size
        let prevSize = sizes[prevI];
        let selfSize = sizes[selfI];
        let sum = prevSize + selfSize;

        // Use prev minSize
        if (offset < 0) {
          let minSize = this.GuiBlocks[prevI].minSize;
          prevSize = Math.max(minSize, prevSize + offset);
          selfSize = sum - prevSize;
        }
        // Use self minSize
        else {
          let minSize = this.GuiBlocks[selfI].minSize;
          selfSize = Math.max(minSize, selfSize - offset);
          prevSize = sum - selfSize;
        }

        // Offset block size
        sizes[prevI] = prevSize;
        sizes[selfI] = selfSize;

        // Depends on bar adjacent-mode
        //console.log(sizes)
        this.blockSizes = this.normlizedBlockSize(sizes, ctx);
      };
      //....................................
      return {
        trigger: ".block-adjust-bar",
        prepare: (_, evt) => {
          evt.stopPropagation();
          this.isDragging = true;
        },
        actived: (ctx) => {
          //console.log("actived", ctx)
          // Get all my blocks and init them rect
          // Set mark
          // Prepare sizing
          let sizes = this.genBlockRealSizes();
          ctx.orgBlockSizes = sizes;
          ctx.viewportSize = _.sum(sizes);
          ctx.prevI = parseInt(ctx.$trigger.getAttribute("adjust-0"));
          ctx.selfI = parseInt(ctx.$trigger.getAttribute("adjust-1"));
          ctx.adjacentMode = ctx.$trigger.getAttribute("adjacent-mode");
        },
        dragging: do_dragging,
        done: (ctx) => {
          // Save customized
          this.trySaveLocalCustomized();
          // Notify whole window resizing
          Ti.Viewport.resize();
        },
        finished: (ctx) => {
          // Reset mark
          this.isDragging = false;
        }
      };
      //....................................
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnBarReset() {
      //console.log("OnBarReset")
      this.blockSizes = null;
      this.trySaveLocalCustomized();
    },
    //--------------------------------------
    OnBarToggleSize(payload) {
      //console.log("OnBarToggleSize")
      //..............................
      let { prevMinimum, selfMinimum, adjacentMode, adjustIndex } = payload;
      //..............................
      let sizes = this.genBlockRealSizes();
      let viewportSize = _.sum(sizes);
      let prevI = adjustIndex[0];
      let selfI = adjustIndex[1];
      //..............................
      const __toggle_sizes = (sizes = []) => {
        let prevSize = sizes[prevI];
        let selfSize = sizes[selfI];
        let sum = prevSize + selfSize;

        let prevMinSize = this.GuiBlocks[prevI].minSize;
        let prevOrgSize = this.blocks[prevI].size;

        let selfMinSize = this.GuiBlocks[selfI].minSize;
        let selfOrgSize = this.blocks[selfI].size;

        // Prev
        if ("prev" == adjacentMode || ("both" == adjacentMode && 0 == prevI)) {
          // => min
          if (!prevMinimum) {
            sizes[prevI] = prevMinSize;
            sizes[selfI] = sum - prevMinSize;
          }
          // => org
          else {
            prevSize = Ti.Css.toAbsPixel(prevOrgSize, {
              base: viewportSize
            });
            sizes[prevI] = prevSize;
            sizes[selfI] = sum - prevSize;
          }
        }
        // Self
        else {
          // => min
          if (!selfMinimum) {
            sizes[selfI] = selfMinSize;
            sizes[prevI] = sum - selfMinSize;
          }
          // => org
          else {
            selfSize = Ti.Css.toAbsPixel(selfOrgSize, {
              base: viewportSize
            });
            sizes[selfI] = selfSize;
            sizes[prevI] = sum - selfSize;
          }
        }
      };
      //..............................
      __toggle_sizes(sizes);
      //..............................
      this.blockSizes = this.normlizedBlockSize(sizes, {
        adjacentMode,
        viewportSize,
        prevI,
        selfI
      });
      //..............................
      this.trySaveLocalCustomized();
      //..............................
      this.$nextTick(() => {
        Ti.Viewport.resize();
      });
    },
    //--------------------------------------
    normlizedBlockSize(
      sizes = [],
      { adjacentMode, viewportSize, prevI, selfI } = {}
    ) {
      //console.log("normlizedBlockSize", adjacentMode)
      // Depends on bar adjacent-mode
      switch (adjacentMode) {
        case "prev":
          sizes[selfI] = null;
          break;
        case "self":
          sizes[prevI] = null;
          break;
        case "none":
          if (0 == prevI) {
            sizes[selfI] = null;
          } else {
            sizes[prevI] = null;
          }
      }

      // Cover to percent
      if ("%" == this.BlockAdjustMode) {
        return _.map(sizes, (sz) => {
          if (null === sz) {
            return null;
          }
          return Ti.S.toPercent(sz / viewportSize);
        });
      }

      return sizes;
    },
    //--------------------------------------
    // When click the `min` button, it will shrink which block
    // ajacent with the bar.
    //
    //  [Prev] || [Self]
    //
    //  - prev: set prev block to mininum size
    //  - self: set self block to minimum size
    //  - both: if prev is head block, set it to minimum size,
    //          else set the next to minimum size
    //  - none: do nothing
    //
    getBlockAdjacentMode(prevI, selfI) {
      let prevSize = Ti.Util.fallbackNil(this.blocks[prevI].size, "stretch");
      let selfSize = Ti.Util.fallbackNil(this.blocks[selfI].size, "stretch");
      let prevIsStrech = "stretch" == prevSize;
      let selfIsStrech = "stretch" == selfSize;

      // .. 40        | <stretch> ..
      if (!prevIsStrech && selfIsStrech) {
        return "prev";
      }
      // .. <stretch> | 40   ..
      else if (prevIsStrech && !selfIsStrech) {
        return "self";
      }
      // .. 40        | 80   ..
      else if (!prevIsStrech && !selfIsStrech) {
        return "both";
      }
      // .. <stretch> | <stretch> ..
      return "none";
    },
    //--------------------------------------
    genBlockRealSizes() {
      let $blocks = Ti.Dom.findAll(":scope > .ti-gui-block", this.$el);
      let sizes = [];
      _.forEach($blocks, ($block) => {
        let rect = $block.getBoundingClientRect();
        let sz = rect[this.block_size_by];
        sizes.push(sz);
      });
      return sizes;
    },
    //--------------------------------------
    getBlockSize(index) {
      if (this.blockSizes) {
        return _.nth(this.blockSizes, index) || null;
      }
      return (_.nth(this.blocks, index) || {}).size;
    },
    //--------------------------------------
    isBlockSizeMinimum(index) {
      if (index >= 0 && index < this.$children.length) {
        return this.$children[index].isMinimumSize;
      }
    },
    //--------------------------------------
    trySaveLocalCustomized() {
      if (this.keepCustomizedTo) {
        let sizes = _.isEmpty(this.blockSizes) ? null : this.blockSizes;
        Ti.Storage.local.setObject(this.keepCustomizedTo, sizes);
      }
    },
    //--------------------------------------
    tryRestoreLocalCustomized() {
      if (this.keepCustomizedTo) {
        let sizes = Ti.Storage.local.getObject(this.keepCustomizedTo);
        if (_.isArray(sizes)) {
          this.blockSizes = sizes;
        }
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  mounted() {
    this.tryRestoreLocalCustomized();
  }
  //////////////////////////////////////////
};
