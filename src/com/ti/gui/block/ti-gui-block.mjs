export default {
  ///////////////////////////////////////////
  inject: ["$gui"],
  /////////////////////////////////////////
  data: () => ({
    myRect: undefined
  }),
  /////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "type": {
      type: String,
      default: null,
      validator: (v) => {
        return Ti.Util.isNil(v)
          || /^(cols|rows|tabs)$/.test(v)
      }
    },
    "name": {
      type: String,
      default: null
    },
    "body": {
      type: [String, Object],
      default: null
    },
    "icon": {
      type: [String, Object],
      default: null
    },
    "title": {
      type: String,
      default: null
    },
    "embedIn": {
      type: String,
      default: null,
      validator: (v) => /^(panel|rows|cols|tabs)$/.test(v)
    },
    "blocks": {
      type: Array,
      default: () => []
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "actions": {
      type: Array,
      default: () => []
    },
    "actionStatus": {
      type: Object,
      default: () => ({})
    },
    "actionVars": {
      type: [Object, Function]
    },
    "comClass": {
      type: String,
      default: undefined
    },
    "overflow": {
      type: String,
      default: undefined,
      validator: v => (_.isUndefined(v) || (/^(auto|none|fill|cover)$/.test(v)))
    },
    "flex": {
      type: String,
      default: undefined,
      validator: (v) => (_.isUndefined(v) || /^(nil|auto|grow|shrink|both|none)$/.test(v))
    },
    "order": {
      type: Number
    },
    // TODO 这个属性是干啥的？ 有点忘记了，好像没用
    "captureEvents": {
      type: Object,
      default: () => ({})
    },
    "resizeMode": {
      type: String
    },
    "adjacentMode": {
      type: String
    },
    "adjustBarAt": {
      type: String
    },
    "adjustIndex": {
      type: Array
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "hideTitle": {
      type: Boolean,
      default: false
    },
    "mainConClass": undefined,
    "mainConStyle": {
      type: Object,
      default: undefined
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "size": {
      type: [String, Number],
      default: null
    },
    "minSize": {
      type: Number,
      default: 50
    },
    "schema": {
      type: Object,
      default: () => ({})
    },
    "shown": {
      type: Object,
      default: () => ({})
    },
    // Those 3 props for by-pass to sub-(cols/rows)
    "tabAt": undefined,
    "adjustable": undefined,
    "border": undefined,
    "keepCustomizedTo": undefined
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        [`gui-block-${this.name}`]: this.name ? true : false,
        "is-show-header": this.isShowHeader,
        "is-hide-header": !this.isShowHeader,
        "ti-fill-parent": /^(tabs|panel)$/.test(this.embedIn)
      }, `is-flex-${this.FlexName}`)
    },
    //--------------------------------------
    TopStyle() {
      let css = ({
        //..................................
        rows: () => ({
          height: this.BlockSize
        }),
        //..................................
        cols: () => ({
          width: this.BlockSize
        }),
        //..................................
        tabs: () => ({}),
        //..................................
        panel: () => ({})
        //..................................
      })[this.embedIn]()
      if (!Ti.Util.isNil(this.order)) {
        css.order = this.order
      }
      return Ti.Css.toStyle(css)
    },
    //--------------------------------------
    hasAdjustBar() {
      return this.adjustBarAt && "none" != this.adjustBarAt
    },
    //--------------------------------------
    MainConClass() {
      let klass = {}
      if (!this.isFlexNil) {
        _.assign(klass, {
          "fill-parent": "fill" == this.TheOverflow,
          "cover-parent": "cover" == this.TheOverflow
        })
      }
      return Ti.Css.mergeClassName(klass, this.mainConClass)
    },
    //--------------------------------------
    MainConStyle() {
      return Ti.Css.toStyle(this.mainConStyle)
    },
    //--------------------------------------
    MainComponentClass() {
      return Ti.Css.mergeClassName(
        this.$gui.defaultComClass,
        this.comClass
      )
    },
    //--------------------------------------
    TheOverflow() {
      let ov = this.overflow || this.$gui.defaultOverflow || "auto"
      if ("auto" == ov) {
        if (this.isFlexNone) {
          return "fill"
        }
        if (/^(both|shrink)$/.test(this.FlexName)) {
          return "cover"
        }
      }
      return ov
    },
    //--------------------------------------
    BlockSize() {
      let size = this.size
      return /^(auto|stretch)$/.test(size)
        ? null
        : size
    },
    //--------------------------------------
    FlexName() {
      let flex = this.flex || this.$gui.defaultFlex || "auto"
      if ("auto" == flex) {
        if ("stretch" == this.size || Ti.Util.isNil(this.size)) {
          return "both"
        }
        return "none"
      }
      return flex || "both"
    },
    //--------------------------------------
    isFlexNil() {
      return "nil" == this.FlexName
    },
    //--------------------------------------
    isFlexNone() {
      return "none" == this.FlexName
    },
    //--------------------------------------
    isShowHeader() {
      if (this.hideTitle || 'tabs' == this.embedIn) {
        return false
      }
      if (this.title || this.hasActions) {
        return true
      }
      return false
    },
    //--------------------------------------
    hasActions() {
      return !_.isEmpty(this.actions)
    },
    //--------------------------------------
    TheActionVars() {
      if (this.actionVars) {
        return () => {
          let ctx = {
            $main: this.$main(),
            state: Ti.App(this).$state()
          }
          return Ti.Util.explainObj(ctx, this.actionVars, {
            evalFunc: true
          })
        }
      }
    },
    //--------------------------------------
    TheCom() {
      //....................................
      // Body -> Component
      if (this.body) {
        let com = _.isString(this.body) ? this.schema[this.body] : this.body
        if (com) {
          let parent = this.schema[com.extends]
          let self = _.omit(com, "extends")
          com = _.merge({}, parent, self)
          return _.defaults(com, {
            comType: "ti-label",
            comConf: {}
          })
        }
      }
      //....................................
      // Sub GUI
      if (!_.isEmpty(this.blocks)) {
        let comType = `ti-gui-${this.type || "cols"}`
        let comConf = {
          tabAt: this.tabAt,
          border: this.border,
          adjustable: this.adjustable,
          keepCustomizedTo: this.keepCustomizedTo,
          blocks: this.blocks,
          schema: this.schema,
          actionStatus: this.actionStatus,
          shown: this.shown,
          defaultFlex: this.defaultFlex
        }
        return {
          comType, comConf
        }
      }
      //....................................
    },
    //--------------------------------------
    isMinimumSize() {
      if (this.myRect) {
        if ("col-resize" == this.resizeMode) {
          return Math.floor(this.myRect.width) <= this.minSize
        }
        if ("row-resize" == this.resizeMode) {
          return Math.floor(this.myRect.height) <= this.minSize
        }
      }
    },
    //--------------------------------------
    isPrevMinimumSize() {
      if (this.adjustIndex && this.adjustIndex.length == 2) {
        let prevI = this.adjustIndex[0]
        return this.$parent.isBlockSizeMinimum(prevI)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    __before_bubble({ name, args }) {
      if (this.name) {
        return {
          name: `${this.name}::${name}`,
          args
        }
      }
    },
    //--------------------------------------
    $main() {
      return _.last(this.$children)
    },
    //--------------------------------------
    OnResize() {
      if (_.isElement(this.$el)) {
        this.myRect = Ti.Rects.createBy(this.$el)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "name": {
      handler: function (newVal, oldVal) {
        // Guard
        if (!this.$gui)
          return
        // Unregister old
        if (oldVal) {
          this.$gui.unregisterBlock(oldVal)
        }
        // Register self
        if (newVal) {
          this.$gui.registerBlock(newVal, this)
        }
      },
      immediate: true
    },
    "size": {
      handler: function (newVal, oldVal) {
        if (newVal != oldVal) {
          this.OnResize()
        }
      },
      immediate: true
    }
  },
  //////////////////////////////////////////
  mounted() {
    Ti.Viewport.watch(this, {
      resize: () => {
        this.OnResize()
      }
    })
    this.OnResize()
  },
  //////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Viewport.unwatch(this)
    if (this.name) {
      this.$gui.unregisterBlock(this.name)
    }
  }
  //////////////////////////////////////////
}