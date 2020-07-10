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
    "altDisplay" : {
      type: [Object, Array],
      default: ()=>[]
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
    "value" : {
      type: [Boolean, String, Number, Array],
      default: true
    },
    "depth": {
      type: Number,
      default: 0
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    //-----------------------------------
    // Self Props
    //-----------------------------------
    "action" : {
      type : [String, Object, Function],
      default: undefined
    },
    "notify" : {
      type : [Boolean, String],
      default: false
    },
    "wait" : {
      type : Number,
      default: 0
    },
    "shortcut": {
      type: String,
      default: undefined
    }
  },
  ///////////////////////////////////////
  computed: {
    notifyName() {
      if(this.notify) {
        return _.isString(this.notify)
                ? this.notify
                : this.name;
      }
    },
    TheAction() {
      if(_.isFunction(this.action) && this.wait > 0) {
        return _.debounce(this.action, this.wait, {leading:true})
      }
      return this.action
    }
  },
  ///////////////////////////////////////
  methods : {
    OnFired(val) {
      // Call Action
      if(this.action) {
        let app = Ti.App(this)
        let invoking = Ti.Shortcut.genActionInvoking(this.TheAction, {
          $com : this.$bar.$parent,
          argContext: app.$state()
        })
        // Invoke it
        invoking()
      }

      // notify
      if(this.notifyName) {    
        this.$bar.notifyChange({
          name  : this.notifyName,
          value : val
        })
      }
    }
  },
  ///////////////////////////////////////
  mounted : function() {
    if(this.shortcut) {
      Ti.App(this).guardShortcut(this, this.shortcut, ()=>{
        return this.isEnabled
      })
    }
  },
  ///////////////////////////////////////
  destroyed : function(){
    if(this.shortcut) {
      Ti.App(this).pulloutShortcut(this)
    }
  }
  ///////////////////////////////////////
}
export default _M;