const _M = {
  ///////////////////////////////////////
  inject: ["$bar"],
  ///////////////////////////////////////
  props: {
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
    "shortcut": {
      type: String,
      default: undefined
    },
    "suffixIcon": {
      type: String,
      default: undefined
    },
    "altDisplay": {
      type: [Object, Array],
      default: () => []
    },
    "enabled": {
      type: [Boolean, String, Array, Object],
      default: undefined
    },
    "disabled": {
      type: [Boolean, String, Array, Object],
      default: undefined
    },
    "highlight": {
      type: [Boolean, String, Array, Object],
      default: undefined
    },
    "value": {
      type: [Boolean, String, Number, Array],
      default: undefined
    },
    "depth": {
      type: Number,
      default: 0
    },
    "status": {
      type: Object,
      default: () => ({})
    }
  },
  ///////////////////////////////////////
  computed: {
    //-----------------------------------
    TopClass() {
      return this.getTopClass({
        "is-enabled": this.isEnabled,
        "is-disabled": this.isDisabled,
        "is-highlight": this.isHighlight,
        "is-top": this.isTop,
        "is-sub": this.isSub,
        "has-icon": this.icon ? true : false,
        "no-icon": this.icon ? false : true,
        "show-icon": this.isShowIcon,
        "hide-icon": !this.isShowIcon
      }, `is-depth-${this.depth}`)
    },
    //-----------------------------------
    isTop() { return this.depth == 1 },
    isSub() { return this.depth > 1 },
    //-----------------------------------
    TipMode() {
      return this.isTop ? 'H' : 'V'
    },
    //-----------------------------------
    AltDisplay() {
      if (_.isArray(this.altDisplay)) {
        return this.altDisplay
      }
      return this.altDisplay
        ? [this.altDisplay]
        : []
    },
    //-----------------------------------
    isEnabled() {
      if (!Ti.Util.isNil(this.enabled)) {
        if (!this.isMatchStatus(this.enabled)) {
          return false
        }
      }
      if (!Ti.Util.isNil(this.disabled)) {
        if (this.isMatchStatus(this.disabled)) {
          return false
        }
      }
      return true
    },
    //-----------------------------------
    isDisabled() {
      return !this.isEnabled
    },
    //-----------------------------------
    isHighlight() {
      if (!Ti.Util.isNil(this.highlight)) {
        return this.isMatchStatus(this.highlight)
      }
      return false
    },
    //-----------------------------------
    isShowShortcut() {
      return this.shortcut && this.depth > 1
    },
    //-----------------------------------
    isShowIcon() {
      return !this.hideIcon || this.hasIcon
    },
    //-----------------------------------
    hasIcon() {
      return this.CurrentDisplay.icon ? true : false
    },
    //-----------------------------------
    CurrentDisplay() {
      // if("bold" == this.name)
      //   console.log("CurrentDisplay", this.name)
      // Prepare default
      let dis = {
        icon: this.icon,
        text: this.text,
        tip: this.tip,
        value: this.value
      }
      // Alt Display
      if (!_.isEmpty(this.AltDisplay)) {
        for (let alt of this.AltDisplay) {
          let mat = alt.match || this.name
          if (this.isMatchStatus(mat)) {
            _.assign(dis, _.pick(alt, [
              "icon", "text", "tip", "value"
            ]))
            break
          }
        }
      }
      // Done
      return dis
    },
    //-----------------------------------
    TheValues() {
      let val = this.CurrentDisplay.value
      // Bool
      if (_.isBoolean(val)) {
        return [val, !val]
      }
      // Array
      if (_.isArray(val))
        return val
      // Normal value
      return [val]
    }
    //-----------------------------------
  },
  ///////////////////////////////////////
  methods: {
    //---------------------------------------
    OnClickTop() {
      //console.log("OClickTop")
      if (!this.isDisabled) {
        let val = this.isHighlight
          ? _.last(this.TheValues)
          : _.first(this.TheValues)

        this.$emit('fire', val)
      }
    },
    //---------------------------------------
    isMatchStatus(mat) {
      if (_.isBoolean(mat)) {
        return mat
      }
      // Key | `"saving"`
      if (_.isString(mat)) {
        return _.get(this.status, mat) ? true : false
      }
      // Complex match
      // Match  | `{saving:true}`
      //console.log(mat, this.status)
      return Ti.AutoMatch.test(mat, this.status)
    }
    //---------------------------------------
  }
  ///////////////////////////////////////
}
export default _M;