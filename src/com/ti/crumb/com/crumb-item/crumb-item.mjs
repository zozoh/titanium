export default {
  ////////////////////////////////////////////////////
  props: {
    "index": {
      type: Number,
      default: -1
    },
    "atLast": {
      type: Boolean,
      default: false
    },
    "icon": {
      type: [String, Object],
      default: null
    },
    "text": {
      type: String,
      default: null
    },
    "href": {
      type: String,
      default: null
    },
    "value": {
      type: [String, Number, Boolean, Object],
      default: null
    },
    "pathIcon": {
      type: String,
      default: null
    },
    "asterisk": {
      type: Boolean,
      default: false
    },
    "cancelBubble": {
      type: Boolean,
      default: true
    },
    "eventName": {
      type: [Boolean, String]
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return Ti.Css.mergeClassName({
        "at-tail": this.atLast,
        "at-path": !this.atLast,
        "is-asterisk": this.asterisk,
        "has-event": this.hasEvent,
      }, this.className)
    },
    //------------------------------------------------
    TextClass() {
      return {
        "without-icon": !this.hasIcon && !this.removeIcon
      }
    },
    //------------------------------------------------
    hasIcon() {
      return this.icon ? true : false
    },
    //------------------------------------------------
    TheText() {
      return Ti.I18n.text(this.text);
    },
    //------------------------------------------------
    hasEvent() {
      return this.eventName ? true : false
    },
    //------------------------------------------------
    TheEventName() {
      if (this.eventName) {
        if (_.isBoolean(this.eventName)) {
          return "item:active"
        }
        return this.eventName
      }
    },
    //------------------------------------------------
    TheData() {
      return {
        index: this.index,
        icon: this.icon,
        text: this.text,
        value: this.value,
        href: this.href,
        atLast: this.atLast,
        asterisk: this.asterisk
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    OnClickTop($event) {
      // Show Drop Down
      if (this.hasOptions) {
        $event.stopPropagation()
        this.openDrop()
      }
      // Stop Bubble Up
      else if (this.cancelBubble) {
        $event.stopPropagation()
      }
      // Prevent
      if (this.hasEvent) {
        $event.preventDefault()
      }
      // Emit event
      let name = this.getEventName()
      if (this.href) {
        this.$notify(name, this.TheData)
      }
      // Just notify event
      else if (this.hasEvent) {
        this.$notify(name, this.TheData)
      }
    },
    //------------------------------------------------
    getEventName(dftEventName = "item:active") {
      if (this.eventName) {
        if (_.isBoolean(this.eventName)) {
          return dftEventName
        }
        return this.eventName
      }
      return dftEventName
    },
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}