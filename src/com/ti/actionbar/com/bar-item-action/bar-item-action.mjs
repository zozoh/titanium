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
    "value" : true,
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
      type : Boolean,
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
  methods : {
    OnFired(val) {
      // Call Action
      if(this.action) {
        let app = Ti.App(this)
        let currentData = app.currentData()
        let invoking = Ti.Shortcut.genActionInvoking(this.action, {
          $com : this.$bar.$parent,
          argContext : currentData,
          wait : this.wait
        })
        // Invoke it
        invoking()
      }

      // notify
      if(this.notify && this.name) {
        this.$bar.notifyChange({
          name  : this.name,
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