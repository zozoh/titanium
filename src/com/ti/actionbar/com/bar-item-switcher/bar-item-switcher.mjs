const _M = {
  ///////////////////////////////////////
  inject: ["$bar"],
  ///////////////////////////////////////
  props : {
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
    "hideIcon" : {
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
    "switcher" : {
      type: Object,
      default: ()=>({})
    },
    "enabled": {
      type: [String, Array, Object],
      default: undefined
    },
    "disabled": {
      type: [String, Array, Object],
      default: undefined
    },
    "depth": {
      type: Number,
      default: 0
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    "dftValue" : undefined,
    //-----------------------------------
    // Self Props
    //-----------------------------------
    "action" : {
      type : [String, Object, Function],
      default: undefined
    },
    "notify" : {
      type : String,
      default: undefined
    },
    "payload" : undefined,
    "wait" : {
      type : Number,
      default: 0
    },
    "delay" : {
      type : Number,
      default: 0
    }
  },
  ///////////////////////////////////////
  computed: {
    //-----------------------------------
    TopClass() {
      return this.getTopClass({
        "is-enabled"  : this.isEnabled,
        "is-disabled" : this.isDisabled,
        "is-highlight": this.isHighlight,
        "is-top" : this.depth == 1,
        "is-sub" : this.depth > 1,
        "has-icon" : this.icon ? true : false,
        "no-icon"  : this.icon ? false : true,
        "show-icon": this.isShowIcon,
        "hide-icon": !this.isShowIcon
      }, `is-depth-${this.depth}`)
    },
    //-----------------------------------
    isShowIcon() {
      return !this.hideIcon || this.hasIcon
    },
    //-----------------------------------
    hasIcon() {
      return this.icon ? true : false
    },
    //-----------------------------------
    isEnabled() {
      if(!Ti.Util.isNil(this.enabled)) {
        return this.isMatchStatus(this.enabled)
      }
      if(!Ti.Util.isNil(this.disabled)) {
        if(this.isMatchStatus(this.disabled)) {
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
    TheSetup() {
      return _.assign({
        allowEmpty : false
      }, this.switcher)
    },
    //-----------------------------------
    TheValue() {
      return Ti.Util.fallback(_.get(this.status, this.name), this.dftValue)
    },
    //-----------------------------------
    TheAction() {
      if(_.isFunction(this.action) && this.wait > 0) {
        return _.debounce(this.action, this.wait, {leading:true})
      }
      return this.action
    }
    //-----------------------------------
  },
  ///////////////////////////////////////
  methods : {
    OnSwitcherChange(val) {
      // Call Action
      if(this.action) {
        let app = Ti.App(this)
        let invoking = Ti.Shortcut.genActionInvoking(this.TheAction, {
          $com : this.$bar.$parent,
          argContext: app.$state()
        })
        // Invoke it
        _.delay(()=>{
          invoking(val)
        }, this.delay)
      }

      // notify: eventName
      if(this.notify) {
        let payload = this.payload
        if(payload) {
          payload = Ti.Util.explainObj({
            name  : this.name,
            value : val
          }, payload)
        }
        _.delay(()=>{
          this.$bar.$notify(this.notify, payload)
        }, this.delay)
      }
    }
  }
  ///////////////////////////////////////
}
export default _M;