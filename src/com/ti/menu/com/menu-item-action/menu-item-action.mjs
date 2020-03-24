import {fireable} from "../../menu-items-support.mjs"
//---------------------------------------
export default {
  inject : ["$menu"],
  ///////////////////////////////////////////  
  props : fireable.Props({
    "action" : {
      type : [String, Function],
      default : null
    }
  }),
  ///////////////////////////////////////////
  computed : fireable.Computed(vm=>vm.isProcessing, { 
    isProcessing() {
      return this.status[this.statusKey] 
              ? true : false
    },
    hasShortcut() {
      return this.shortcut ? true : false
    },
    ShortcutText() {
      return this.shortcut || ""
    },
    InvokeFunc() {
      let app = Ti.App(this)
      let currentData = app.currentData()
      return Ti.Shortcut.genActionInvoking(this.action, {
        $com : this.$menu.$parent,
        argContext : currentData,
        wait : this.wait
      })
    }
  }),
  ///////////////////////////////////////////
  methods : {
    onClickTop() {
      // Guard
      if(this.isDisabled) {
        return
      }
      // Call Action
      this.InvokeFunc()
    }
  },
  ///////////////////////////////////////////
  mounted : function() {
    if(this.shortcut) {
      Ti.App(this).guardShortcut(this, this.shortcut, ()=>{
        return this.isEnabled
      })
    }
  },
  ///////////////////////////////////////////
  destroyed : function(){
    if(this.shortcut) {
      Ti.App(this).pulloutShortcut(this)
    }
  }
  ///////////////////////////////////////////
}