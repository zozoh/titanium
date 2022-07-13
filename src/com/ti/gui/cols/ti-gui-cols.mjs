export default {
  /////////////////////////////////////////
  data: () => ({
    blockSizes: undefined
  }),
  /////////////////////////////////////////
  props: {
    "blocks": {
      type: Array,
      default: () => []
    },
    "adjustable": {
      type: Boolean,
      default: true
    },
    "adjustMode": {
      type: String,
      default: "px",
      validator: v => /^(px|%)$/.test(v)
    },
    "keepCustomizedTo": {
      type: String,
      default: undefined
    },
    "border": {
      type: Boolean,
      default: false
    },
    "schema": {
      type: Object,
      default: () => ({})
    },
    "actionStatus": {
      type: Object,
      default: () => ({})
    },
    "shown": {
      type: Object,
      default: () => ({})
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-adjustable": this.adjustable,
        "show-border": this.border
      }, this.className)
    },
    //--------------------------------------
    hasBlocks() {
      return !_.isEmpty(this.blocks)
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
    BlockAdjacentMode() {
      return (prevI, selfI) => {
        let prevSize = Ti.Util.fallbackNil(this.blocks[prevI].size, "stretch")
        let selfSize = Ti.Util.fallbackNil(this.blocks[selfI].size, "stretch")
        let prevIsStrech = "stretch" == prevSize
        let selfIsStrech = "stretch" == selfSize

        // .. 40        | <stretch> ..
        if (!prevIsStrech && selfIsStrech) {
          return "prev"
        }
        // .. <stretch> | 40   ..
        else if (prevIsStrech && !selfIsStrech) {
          return "self"
        }
        // .. 40        | 80   ..
        else if (!prevIsStrech && !selfIsStrech) {
          return "both"
        }
        // .. <stretch> | <stretch> ..
        return "none"
      }
    },
    //--------------------------------------
    ColBlocks() {
      let list = []
      _.forEach(this.blocks, (block, index) => {
        let li = _.omit(block, "size")
        li.index = index
        li.key = block.name || `B${index}`
        if (Ti.Util.isNil(li.minSize)) {
          li.minSize = 50
        }
        if (this.adjustable) {
          li.adjustMode = "col-resize"
          if (li.index > 0) {
            let prevI = li.index - 1
            let selfI = li.index
            li.adjacentMode = this.BlockAdjacentMode(prevI, selfI)
            li.adjustBarAt = "left";
            li.adjustIndex = [prevI, selfI];
          }
        }
        list.push(li)
      })
      return list
    },
    //--------------------------------------
    Draggable() {
      //....................................
      const do_dragging = (ctx) => {
        let { offsetX, orgBlockSizes, prevI, selfI } = ctx
        //console.log("dragging", { offsetX, orgBlockSizes, prevI, selfI })
        let sizes = _.cloneDeep(orgBlockSizes)

        // Block minimum size
        let prevSize = sizes[prevI]
        let selfSize = sizes[selfI]
        let sum = prevSize + selfSize

        // Use prev minSize
        if (offsetX < 0) {
          let minSize = this.ColBlocks[prevI].minSize
          prevSize = Math.max(minSize, prevSize + offsetX)
          selfSize = sum - prevSize
        }
        // Use self minSize
        else {
          let minSize = this.ColBlocks[selfI].minSize
          selfSize = Math.max(minSize, selfSize - offsetX)
          prevSize = sum - selfSize
        }

        // Offset block size
        sizes[prevI] = prevSize
        sizes[selfI] = selfSize

        // Depends on bar adjacent-mode
        this.blockSizes = this.normlizedBlockSize(sizes, ctx)
      }
      //....................................
      return {
        trigger: ".block-adjust-bar",
        prepare: (_, evt) => {
          evt.stopPropagation()
        },
        actived: (ctx) => {
          //console.log("actived", ctx)
          // Get all my blocks and init them rect
          let sizes = this.genBlockRealSizes()
          ctx.orgBlockSizes = sizes
          ctx.viewportWidth = _.sum(sizes)
          ctx.prevI = parseInt(ctx.$trigger.getAttribute("adjust-0"));
          ctx.selfI = parseInt(ctx.$trigger.getAttribute("adjust-1"));
          ctx.adjacentMode = ctx.$trigger.getAttribute("adjacent-mode")
        },
        dragging: do_dragging,
        done: (ctx) => {
          // Save customized
          this.trySaveLocalCustomized()
          // Notify whole window resizing
          Ti.Viewport.resize()
        }
      }
      //....................................
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnBarReset() {
      //console.log("OnBarReset")
      this.blockSizes = null
      this.trySaveLocalCustomized()
    },
    //--------------------------------------
    OnBarToggleSize(payload) {
      //console.log("OnBarToggleSize")
      //..............................
      let {
        prevMinimum, selfMinimum, adjacentMode, adjustIndex
      } = payload
      //..............................
      let sizes = this.genBlockRealSizes()
      let viewportWidth = _.sum(sizes)
      let prevI = adjustIndex[0]
      let selfI = adjustIndex[1]
      //..............................
      const __toggle_sizes = (sizes = []) => {
        let prevSize = sizes[prevI]
        let selfSize = sizes[selfI]
        let sum = prevSize + selfSize

        let prevMinSize = this.ColBlocks[prevI].minSize
        let prevOrgSize = this.blocks[prevI].size

        let selfMinSize = this.ColBlocks[selfI].minSize
        let selfOrgSize = this.blocks[selfI].size

        // Prev
        if ("prev" == adjacentMode || ("both" == adjacentMode && 0 == prevI)) {
          // => min
          if (!prevMinimum) {
            sizes[prevI] = prevMinSize
            sizes[selfI] = sum - prevMinSize
          }
          // => org
          else {
            prevSize = Ti.Css.toAbsPixel(prevOrgSize, {
              base: viewportWidth
            })
            sizes[prevI] = prevSize
            sizes[selfI] = sum - prevSize
          }
        }
        // Self
        else {
          // => min
          if (!selfMinimum) {
            sizes[selfI] = selfMinSize
            sizes[prevI] = sum - selfMinSize
          }
          // => org
          else {
            selfSize = Ti.Css.toAbsPixel(selfOrgSize, {
              base: viewportWidth
            })
            sizes[selfI] = selfSize
            sizes[prevI] = sum - selfSize
          }
        }
      }
      //..............................
      __toggle_sizes(sizes)
      //..............................
      this.blockSizes = this.normlizedBlockSize(sizes, {
        adjacentMode: this.adjacentMode,
        viewportWidth,
        prevI,
        selfI
      })
      //..............................
      this.$nextTick(()=>{
        Ti.Viewport.resize()
      })
    },
    //--------------------------------------
    normlizedBlockSize(sizes = [], {
      adjacentMode,
      viewportWidth,
      prevI,
      selfI
    } = {}) {
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
            sizes[selfI] = null
          } else {
            sizes[prevI] = null
          }
      }

      // Cover to percent
      if ("%" == this.adjustMode) {
        return _.map(sizes, sz => {
          if (null === sz) {
            return null
          }
          return Ti.S.toPercent(sz / viewportWidth)
        })
      }

      return sizes
    },
    //--------------------------------------
    genBlockRealSizes() {
      let $blocks = Ti.Dom.findAll(":scope > .ti-gui-block", this.$el)
      let sizes = []
      _.forEach($blocks, ($block) => {
        sizes.push($block.getBoundingClientRect().width)
      })
      return sizes
    },
    //--------------------------------------
    getBlockSize(index) {
      if (this.blockSizes) {
        return _.nth(this.blockSizes, index) || null
      }
      return (_.nth(this.blocks, index) || {}).size
    },
    //--------------------------------------
    isBlockSizeMinimum(index) {
      if (index >= 0 && index < this.$children.length) {
        return this.$children[index].isMinimumSize
      }
    },
    //--------------------------------------
    trySaveLocalCustomized() {
      if (this.keepCustomizedTo) {
        let sizes = _.isEmpty(this.blockSizes) ? null : this.blockSizes
        Ti.Storage.local.setObject(this.keepCustomizedTo, sizes)
      }
    },
    //--------------------------------------
    tryRestoreLocalCustomized() {
      if (this.keepCustomizedTo) {
        let sizes = Ti.Storage.local.getObject(this.keepCustomizedTo)
        if (_.isArray(sizes)) {
          this.blockSizes = sizes
        }
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  mounted() {
    this.tryRestoreLocalCustomized()
  }
  //////////////////////////////////////////
}