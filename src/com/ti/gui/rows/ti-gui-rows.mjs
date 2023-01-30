export default {
  inheritAttrs: false,
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
      default: "auto",
      validator: v => /^(auto|px|%)$/.test(v)
    },
    "keepCustomizedTo": {
      type: String,
      default: undefined
    },
    "gap": {
      type: Object
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
    isBlockSizeMinimum(index) {
      if (index >= 0 && index < this.$children.length) {
        return this.$children[index].isMinimumSize
      }
    },
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    //--------------------------------------
  }
  //////////////////////////////////////////
}