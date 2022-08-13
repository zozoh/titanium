export default {
  /////////////////////////////////////////
  inject: ["$gui"],
  /////////////////////////////////////////
  data: () => ({
    myBlockTitle: undefined,
    myDockReady: false,
    myConStyle: undefined
  }),
  /////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "title": [String, Function, Object],
    "icon": {
      type: [String, Object]
    },
    "name": {
      type: String
    },
    "type": {
      type: String,
      validator: (v) => {
        return Ti.Util.isNil(v)
          || /^(cols|rows|tabs)$/.test(v)
      }
    },
    "blocks": {
      type: Array,
      default: () => []
    },
    "body": {
      type: [String, Object]
    },
    "referElement": {
      type: [Element, Object]  /*null type is Object*/
    },
    "visibles": {
      type: Object,
      default: () => ({})
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "autoDock": {
      type: [Object, String]
    },
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
    "adjustable": {
      type: [Boolean, String],
      default: true,
      validator: (v) => {
        return _.isBoolean(v) || /^(x|y)$/.test(v)
      }
    },
    "clickMaskToClose": {
      type: Boolean,
      default: false
    },
    "shown": {
      type: Object,
      default: () => ({})
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "hideTitle": {
      type: Boolean,
      default: false
    },
    "conStyle": Object,
    "mainConClass": undefined,
    "mainConStyle": Object,
    "overflow": {
      type: String
    },
    "position": {
      type: String,
      default: "center",
      validator: (v) => {
        return /^(left|right|top|bottom|center|free)$/.test(v)
          || /^((left|right)-top|bottom-(left|right))$/.test(v)
      }
    },
    "fixed": {
      type: Boolean,
      default: false
    },
    "closer": {
      type: String,
      default: "default",
      validator: (v) => (
        _.isNull(v) || /^(default|bottom|top|left|right)$/.test(v)
      )
    },
    "mask": {
      type: Boolean,
      default: false
    },
    "transparent": {
      type: Boolean,
      default: false
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "viewportWidth": {
      type: [String, Number],
      default: 0
    },
    "viewportHeight": {
      type: [String, Number],
      default: 0
    },
    "width": {
      type: [String, Number]
    },
    "height": {
      type: [String, Number]
    },
    "left": {
      type: [String, Number]
    },
    "right": {
      type: [String, Number]
    },
    "top": {
      type: [String, Number]
    },
    "bottom": {
      type: [String, Number]
    },
    //-----------------------------------
    // By Pass
    //-----------------------------------
    "schema": {
      type: Object,
      default: () => ({})
    },
    "captureEvents": undefined,
    "adjustable": undefined,
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "show-mask": this.mask,
        "no-mask": !this.mask,
        "is-bg-transparent": this.transparent,
        "is-bg-opaque": !this.transparent,
        "is-closer-default": this.isCloserDefault,
        "is-fixed": this.fixed
      }, `at-${this.position}`)
    },
    //--------------------------------------
    TopStyle() {
      let visibility = ""
      if (this.isAutoDock) {
        if (this.myDockReady) {
          visibility = ""
        } else {
          visibility = "hidden"
        }
      }
      return Ti.Css.toStyle({
        left: this.left,
        right: this.right,
        top: this.top,
        bottom: this.bottom,
        visibility
      })
    },
    //--------------------------------------
    hasCloser() {
      return this.closer ? true : false
    },
    //--------------------------------------
    isAutoDock() {
      return this.autoDock
        && "free" == this.position
        && _.isElement(this.referElement)
    },
    //--------------------------------------
    isCloserDefault() {
      return true === this.closer || "default" == this.closer
    },
    //--------------------------------------
    CloserClass() {
      return Ti.Css.mergeClassName({
        'as-lamp-cord': !this.isCloserDefault,
        'as-default': this.isCloserDefault,
        [`at-${this.closer}`]: !this.isCloserDefault
      })
    }
    //--------------------------------------
    // theCloserIconName() {
    //   return this.isCloserDefault
    //           ? "zmdi-minus"
    //           : "zmdi-close";
    //}
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnClose() {
      this.$gui.OnBlockHide(this.name)
    },
    //--------------------------------------
    OnClickMask() {
      if (this.clickMaskToClose) {
        this.$gui.OnBlockHide(this.name)
      }
    },
    //--------------------------------------
    OnContentReady() {
      this.dockPanelToReferElement()
    },
    //--------------------------------------
    isBlockSizeMinimum(index) {
      return false
    },
    //--------------------------------------
    async evalBlockTitle() {
      if(this.title) {
        this.myBlockTitle = await Ti.Util.explainObj(this.$gui.vars, this.title)
      }
    },
    //--------------------------------------
    evalConStyle() {
      // Guard
      if (!_.isElement(this.$el)) {
        return
      }
      let css = _.assign({}, this.conStyle)
      let $win = this.$el.ownerDocument.defaultView
      if (!Ti.Util.isNil(this.width)) {
        if (this.fixed) {
          css.width = Ti.Css.toPixel(this.width, $win.innerWidth, 0)
        } else {
          css.width = Ti.Css.toPixel(this.width, this.viewportWidth, 0)
        }
      }
      if (!Ti.Util.isNil(this.height)) {
        if (this.fixed) {
          css.height = Ti.Css.toPixel(this.height, $win.innerHeight, 0)
        } else {
          css.height = Ti.Css.toPixel(this.height, this.viewportHeight, 0)
        }
      }
      this.myConStyle = Ti.Css.toStyle(css)
    },
    //--------------------------------------
    dockPanelToReferElement() {
      let visi = _.get(this.visibles, this.name)
      if (visi && this.isAutoDock) {
        let dockOption = _.assign({}, this.autoDock)
        if (_.isString(this.autoDock)) {
          dockOption = {
            mode: this.autoDock,
            space: 10
          }
        }
        // _.assign(dockOption, {
        //   position: "fixed"
        // })
        this.$nextTick(() => {
          Ti.Dom.dockTo(this.$el, this.referElement, dockOption)
          _.delay(() => {
            this.myDockReady = true
          }, 0)
        })
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "autoDock": "dockPanelToReferElement",
    "referElement": "dockPanelToReferElement",
    "visibles": "dockPanelToReferElement",
    "fixed": "evalConStyle",
    "viewportWidth": "evalConStyle",
    "width": "evalConStyle",
    "height": "evalConStyle"
  },
  //////////////////////////////////////////
  mounted: function () {
    this.evalBlockTitle()
    this.evalConStyle()
  }
  //////////////////////////////////////////
}