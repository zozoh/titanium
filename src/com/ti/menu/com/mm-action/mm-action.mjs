import {fireable} from "../../support/ti-menu-items.mjs"
//---------------------------------------
export default {
  props : fireable.Props({
    action : {
      type : String,
      default : null
    }
  }),
  computed : fireable.Computed(vm=>vm.isProcessing, { 
    isProcessing() {
      return this.status[this.statusKey] 
              ? true : false
    },
    hasShortcut() {
      return this.shortcut ? true : false
    },
    shortcutText() {
      return this.shortcut || ""
    }
  }),
  mounted : function() {
    if(this.shortcut) {
      Ti.Shortcut.addGuard(this.shortcut, ()=>{
        return this.isEnabled
      })
    }
  }
}