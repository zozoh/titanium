function THE(vm, fldName) {
  if(vm.async && vm.status[vm.statusKey]) {
    return vm.async[fldName] || vm[fldName]
  }
  return vm[fldName]
}
function HAS(vm, fldName) {
  return THE(vm, fldName) ? true : false
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
    },
    status : {
      type : Object,
      default : ()=>({})
    },
    statusKey : {
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