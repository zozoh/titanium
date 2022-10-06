const _M = {
  /////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "setup": {
      type: [Array, Object],
      default: () => []
    },
    "icon": {
      type: [Object, String]
    },
    "text": {
      type: String
    },
    "href": {
      type: String
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "disabled": {
      type: Boolean,
      default: undefined
    },
    "handler": {
      type: Function
    },
    "eventName": {
      type: String
    },
    "payload": {
      type: [String, Object, Array, Boolean, Number],
      default: undefined
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "size": {
      type: String,
      default: "normal",
      validator: v => /^(big|normal|small|tiny)$/.test(v)
    },
    // center|top|left|right|bottom|
    // left-top|right-top|bottom-left|bottom-right
    "align": {
      type: String,
      default: "center"
    },
    "mainStyle": {
      type: Object
    },
    "itemStyle": {
      type: Object
    },
  },
  //////////////////////////////////////////
  computed: {
    //......................................
    TopClass() {
      return this.getTopClass(`is-${this.size}`, `at-${this.align}`)
    },
    //......................................
    ButtonItems() {
      let re = [];
      let list = []
      // Default setting
      let dft = {}
      if (!Ti.Util.isNil(this.icon)) {
        dft.icon = this.icon
      }
      if (!Ti.Util.isNil(this.text)) {
        dft.text = this.text
      }
      if (!Ti.Util.isNil(this.disabled)) {
        dft.disabled = this.disabled
      }
      if (!Ti.Util.isNil(this.handler)) {
        dft.handler = this.handler
      }
      if (!Ti.Util.isNil(this.eventName)) {
        dft.eventName = this.eventName
      }
      if (!Ti.Util.isNil(this.payload)) {
        dft.payload = this.payload
      }
      if (!_.isEmpty(dft)) {
        dft.name = "_DFT_BTN_ITEM_"
        list.push(dft)
      }
      // More setup
      let setup = _.concat([], list, this.setup)
      _.forEach(setup, (li, index) => {
        let it = {}
        it.name = li.name || `item-${index}`
        it.eventName = li.eventName || it.name
        it.payload = li.payload
        it.icon = li.icon
        it.text = li.disabled ? li.disabledText || li.text : li.text
        it.disabled = li.disabled
        it.handler = li.handler
        it.buttonClass = Ti.Css.mergeClassName({
          [`as-do-${it.name}`]: true,
          "is-enabled": !li.disabled ? true : false,
          "is-disabled": li.disabled ? true : false,
          "is-invert-icon": li.invertIcon ? true : false
        }, li.className)
        it.style = _.assign({}, this.itemStyle, li.style)
        re.push(it)
      })
      return re
    }
    //......................................
  },
  //////////////////////////////////////////
  methods: {
    OnClickItem(it) {
      if (!it.disabled) {
        if (_.isFunction(it.handler)) {
          it.handler()
        }
        if (_.isString(it.eventName)) {
          this.$notify(it.eventName, it.payload)
        }
      }
    }
  }
  //////////////////////////////////////////
}
export default _M;