const _M = {
  ///////////////////////////////////////
  inject: ["$bar"],
  ///////////////////////////////////////////
  provide: function () {
    return { depth: this.depth + 1 }
  },
  ///////////////////////////////////////
  data: () => ({
    collapse: true,
    isDocked: false,
    barItems: [],
    IamHoverAt: 0
  }),
  ///////////////////////////////////////
  props: {
    //-----------------------------------
    // Same as <bar-item-info>
    //-----------------------------------
    "name": {
      type: String,
      default: undefined
    },
    "icon": {
      type: String,
      default: undefined
    },
    "hideIcon": {
      type: Boolean,
      default: false
    },
    "text": {
      type: String,
      default: undefined
    },
    "tip": {
      type: String,
      default: undefined
    },
    "altDisplay": {
      type: [Object, Array],
      default: () => []
    },
    "topHoverOpen": {
      type: Boolean,
      default: false
    },
    "enabled": {
      type: [String, Array, Object],
      default: undefined
    },
    "disabled": {
      type: [String, Array, Object],
      default: undefined
    },
    "highlight": {
      type: [String, Array, Object],
      default: undefined
    },
    "depth": {
      type: Number,
      default: 0
    },
    "status": {
      type: Object,
      default: () => ({})
    },
    //-----------------------------------
    // Self Props
    //-----------------------------------
    "items": {
      type: Array,
      default: () => []
    },
    "autoExtend": {
      type: Boolean,
      default: false
    }
  },
  ///////////////////////////////////////////
  computed: {
    //---------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-collapse": this.collapse,
        "is-extended": !this.collapse,
        "is-depth-x": this.isDepthX,
      }, `is-depth-${this.depth}`)
    },
    //---------------------------------------
    isDepth0() { return 0 == this.depth },
    isDepth1() { return 1 == this.depth },
    isDepthX() { return this.depth > 1 },
    //---------------------------------------
    hasInfo() {
      return this.icon || this.text
    },
    //---------------------------------------
    isChildrenWithoutIcon() {
      for (let it of this.items) {
        if (it.comConf && it.comConf.icon) {
          return false
        }
      }
      return true
    },
    //---------------------------------------
    showChildren() {
      return this.isDepth0 || !this.collapse
    },
    //---------------------------------------
    ItemSuffixIcon() {
      if (this.isDepthX) {
        return "im-angle-right"
      }
    },
    //---------------------------------------
    ChildrenStyle() {
      if (!this.isDepth0) {
        if (!this.isDocked) {
          return { "visibility": "hidden" }
        }
      }
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  methods: {
    //---------------------------------------
    OnMouseEnter() {
      this.IamHoverAt = Date.now()
      if (this.isDepthX || this.topHoverOpen) {
        this.doExtend()
      }
      else if (this.topHoverOpen) {
        _.delay(() => {
          this.doExtend()
        }, 202)
      }
    },
    //---------------------------------------
    OnMouseHover() {
      this.IamHoverAt = Date.now()
    },
    //---------------------------------------
    OnMouseLeave() {
      if (this.isDepthX) {
        this.doCollapse()
      }
      else if (this.topHoverOpen) {
        _.delay(() => {
          this.tryCollape()
        }, 201)
      }
    },
    //---------------------------------------
    OnFired(collapse) {
      if (collapse) {
        this.doExtend()
      } else {
        this.doCollapse()
      }
    },
    //---------------------------------------
    tryCollape() {
      let du = Date.now() - this.IamHoverAt
      if (du > 200) {
        this.doCollapse()
      }
    },
    //---------------------------------------
    doExtend() {
      this.collapse = false
      //this.$bar.notifyChange({name:this.name, value:true})
    },
    //---------------------------------------
    doCollapse() {
      this.collapse = true
      this.isDocked = false
      //this.$bar.notifyChange({name:this.name, value:false})
    },
    //---------------------------------------
    doDockChildren() {
      //console.log("collapse changed", this.collapse)
      this.$nextTick(() => {
        if (this.$refs.children && this.depth > 0) {
          Ti.Dom.dockTo(this.$refs.children, this.$el, {
            mode: this.isDepthX ? "V" : "H",
            position: "fixed",
            space: this.isDepthX ? { x: -1 } : { y: 3 }
          })
          _.delay(() => {
            this.isDocked = true
          }, 5)
        }
      })
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  watch: {
    "collapse": "doDockChildren"
  },
  ///////////////////////////////////////////
  mounted: function () {
    this.doDockChildren()
    this.$bar.allocGroup(this)
  },
  ///////////////////////////////////////////
  beforeDestroy: function () {
    this.$bar.freeGroup(this)
  }
  ///////////////////////////////////////////
}
export default _M;