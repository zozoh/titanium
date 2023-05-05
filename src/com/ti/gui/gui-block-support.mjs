export default {
  /////////////////////////////////////////
  data: () => ({
    isDragging: false
  }),
  /////////////////////////////////////////
  props: {
    "blocks": {
      type: Array,
      default: () => []
    },
    "adjustMode": {
      type: String,
      default: "auto",
      validator: (v) => /^(auto|px|%)$/.test(v)
    },
    "keepCustomizedTo": {
      type: String,
      default: undefined
    },
    "card": {
      type: String,
      validator: (v) => /^(none|comfy|normal|tiny)$/.test(v)
    },
    "outsideCardLayout": {
      type: Boolean,
      default: false
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
    TopClass() {
      return Ti.Css.mergeClassName(
        {
          "is-adjustable": this.adjustable,
          "show-border": this.border,
          "is-outside-card-layout": this.outsideCardLayout,
          "no-outside-card-layout": !this.outsideCardLayout
        },
        this.className
      );
    },
    //--------------------------------------
    hasBlocks() {
      return !_.isEmpty(this.blocks);
    },
    //--------------------------------------
    BlockAdjustMode() {
      if ("auto" == this.adjustMode) {
        for (let block of this.blocks) {
          if (!Ti.Util.isNil(block.size)) {
            if (/%$/.test(block.size)) {
              return "%";
            }
            return "px";
          }
        }
        return "px";
      }
      return this.adjustMode;
    },
    //--------------------------------------
    GuiBlocks() {
      let list = [];
      _.forEach(this.blocks, (block, index) => {
        let li = _.omit(block, "size");
        li.index = index;
        li.key = block.name || `B${index}`;
        if (this.card) {
          li.outsideCardLayout = true;
        }
        if (Ti.Util.isNil(li.minSize)) {
          li.minSize = 50;
        }
        if (this.adjustable && _.isFunction(this.getBlockAdjacentMode)) {
          li.resizeMode = this.resize_mode;
          if (li.index > 0) {
            let prevI = li.index - 1;
            let selfI = li.index;
            li.adjacentMode = this.getBlockAdjacentMode(prevI, selfI);
            li.adjustBarAt = this.adjust_bar_at;
            li.resizeMode = this.resize_mode;
            li.adjustIndex = [prevI, selfI];
          }
        }
        list.push(li);
      });
      return list;
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
};
