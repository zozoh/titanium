function THE(vm, key) {
  if(vm.processing && vm.async) {
    return vm.async[key] || vm[key]
  }
  return vm[key]
}
function HAS(vm, key) {
  return THE(vm, key) ? true : false
}
//---------------------------------------
export default {
  data : ()=>({
    processing : false
  }),
  props : {
    comType : {
      type : String,
      default : null
    },
    type : {
      type : String,
      default : null
    },
    icon : {
      type : String,
      default : null
    },
    text : {
      type : String,
      default : null
    },
    tip : {
      type : String,
      default : null
    },
    async :{
      type : Object,
      default : null
    },
    action : {
      type : String,
      default : null
    }
  },
  computed : {
    theIcon() {return THE(this, "icon")},
    theText() {return THE(this, "text")},
    theTip () {return THE(this, "tip")},
    hasIcon() {return HAS(this, "icon")},
    hasText() {return HAS(this, "text")},
    hasTip () {return HAS(this, "tip")}
  }
}