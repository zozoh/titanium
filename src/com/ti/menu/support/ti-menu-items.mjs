//---------------------------------------
function THE(isAlt, vm, fldName) {
  if(vm.altDisplay && isAlt(vm)) {
    return vm.altDisplay[fldName] || vm[fldName]
  }
  return vm[fldName]
}
function HAS(isAlt, vm, fldName) {
  return THE(isAlt, vm, fldName) ? true : false
}
//---------------------------------------
export const fireable = {
  Props(props={}){
    return _.assign({
      comType : {
        type : String,
        default : null
      },
      isTop : {
        type : Boolean,
        default : false
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
      altDisplay :{
        type : Object,
        default : null
      },
      status : {
        type : Object,
        default : ()=>({})
      },
      statusKey : {
        type : String,
        default : null
      },
      enableBy : {
        type : String,
        default : null
      },
      disableBy : {
        type : String,
        default : null
      },
      shortcut : {
        type : String,
        default : null
      }
    }, props)
  },
  Computed(isAlt, comp={}) {
    return _.assign({
      theIcon() {return THE(isAlt, this, "icon")},
      theText() {return THE(isAlt, this, "text")},
      theTip () {return THE(isAlt, this, "tip")},
      hasIcon() {return HAS(isAlt, this, "icon")},
      hasText() {return HAS(isAlt, this, "text")},
      hasTip () {return HAS(isAlt, this, "tip")},
      isCaptureWhenAltDisplay() {
        return this.altDisplay && this.altDisplay.capture !== false
      },
      isEnabled() {
        if(this.enableBy) {
          return this.status[this.enableBy]
        }
        if(this.disableBy) {
          return !this.status[this.disableBy]
        }
        return true
      },
      isDisabled() {
        if(this.enableBy) {
          return !this.status[this.enableBy]
        }
        if(this.disableBy) {
          return this.status[this.disableBy]
        }
        return false
      }
    }, comp)
  }
}