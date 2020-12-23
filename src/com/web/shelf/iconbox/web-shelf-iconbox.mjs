const _M = {
  //////////////////////////////////////////
  data : ()=>({
    isOpened: true
  }),
  //////////////////////////////////////////
  props : {
    "icon": {
      type: [Object, String],
      default: "im-menu"
    },
    "closeIcon": {
      type: [Object, String],
      default: "im-x-mark"
    },
    "mode": {
      type: String,
      default: "left",
      validator: v => /^(left|right)$/.test(v)
    },
    "head": {
      type: Object,
      /* {comType, comConf} */
      default: undefined
    },
    "body": {
      type: Object,
      /* {comType, comConf} */
      default: undefined
    },
    "foot": {
      type: Object,
      /* {comType, comConf} */
      default: undefined
    },
    "width": {
      type: [Number, String],
      default: undefined
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-opened" : this.isOpened,
        "is-closed" : !this.isOpened,
      }, `is-mode-${this.mode}`)
    },
    //--------------------------------------
    hasHead() {
      return this.head && this.head.comType
    },
    //--------------------------------------
    hasBody() {
      return this.body && this.body.comType
    },
    //--------------------------------------
    hasFoot() {
      return this.foot && this.foot.comType
    },
    //--------------------------------------
    PanelStyle() {
      return Ti.Css.toStyle({
        width: this.width
      })
    },
    //--------------------------------------
    PanelTransName() {
      return `ti-trans-slide-${this.mode}`
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnToggleMode() {
      this.isOpened = !this.isOpened
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    
  }
  //////////////////////////////////////////
}
export default _M;