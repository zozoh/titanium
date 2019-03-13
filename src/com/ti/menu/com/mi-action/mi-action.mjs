import {fireable} from "../../support/ti-menu-items.mjs"
//---------------------------------------
export default {
  props : fireable.Props({
    action : {
      type : String,
      default : null
    }
  }),
  computed : fireable.Computed(
    (vm)=>{
      return vm.isProcessing
    }, { 
      isProcessing() {
        return this.status[this.statusKey] 
                ? true : false
      }
    }
  )
}