const _M = {
  ///////////////////////////////////////
  inject: ["$bar"],
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
    "enabled": {
      type: [String, Array, Object, Boolean],
      default: undefined
    },
    "disabled": {
      type: [String, Array, Object, Boolean],
      default: undefined
    },
    "highlight": {
      type: [String, Array, Object, Boolean],
      default: undefined
    },
    "value": {
      type: [Boolean, String, Number, Array],
      default: true
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
    "action": {
      type: [String, Object, Function],
      default: undefined
    },
    "notifyChange": {
      type: [Boolean, String],
      default: false
    },
    "eventName": {
      type: String
    },
    "payload": undefined,
    "wait": {
      type: Number,
      default: 0
    },
    "delay": {
      type: Number,
      default: 0
    },
    "shortcut": {
      type: String,
      default: undefined
    }
  },
  ///////////////////////////////////////
  computed: {
    //-----------------------------------
    NotifyChangeName() {
      if (this.notifyChange) {
        return _.isString(this.notifyChange)
          ? this.notifyChange
          : this.name;
      }
    },
    //-----------------------------------
    TheAction() {
      if (_.isFunction(this.action) && this.wait > 0) {
        return _.debounce(this.action, this.wait, { leading: true })
      }
      return this.action
    }
    //-----------------------------------
  },
  ///////////////////////////////////////
  methods: {
    OnFired(val) {
      let app = Ti.App(this)
      let argContext = app.$state()
      if (this.$bar.vars) {
        //console.log("eval bar vars")
        argContext = Ti.Util.explainObj(app.$state(), this.$bar.vars, {
          evalFunc: true
        })
      }
      // Call Action
      if (this.action) {
        let invoking = Ti.Shortcut.genActionInvoking(this.TheAction, {
          $com: this.$bar.$parent,
          argContext
        })
        // Invoke it
        _.delay(() => {
          invoking(val)
        }, this.delay)
      }

      // notify: name/value object
      if (this.NotifyChangeName) {
        _.delay(() => {
          this.$bar.notifyChange({
            name: this.NotifyChangeName,
            value: val
          })
        }, this.delay)
      }

      // notify: eventName
      if (this.eventName) {
        let payload = this.payload
        if (payload) {
          payload = Ti.Util.explainObj({
            name: this.name,
            value: val,
            vars: argContext
          }, payload)
        }
        _.delay(() => {
          this.$bar.$notify(this.eventName, payload)
        }, this.delay)
      }
    }
  },
  ///////////////////////////////////////
  mounted: function () {
    if (this.shortcut) {
      Ti.App(this).guardShortcut(this, this.shortcut, () => {
        return this.isEnabled
      })
    }
  },
  ///////////////////////////////////////
  destroyed: function () {
    if (this.shortcut) {
      Ti.App(this).pulloutShortcut(this)
    }
  }
  ///////////////////////////////////////
}
export default _M;