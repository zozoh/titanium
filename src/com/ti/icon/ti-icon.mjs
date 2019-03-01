export default {
  props : {
    value : {
      type : String,
      default : ""
    },
    size : {
      type : [Number, String],
      default : ""
    },
    color : {
      type : String,
      default : ""
    },
    opacity : {
      type : Number,
      default : -1
    }
  },
  computed : {
    isLiga() {
      return !/^([a-z]+)-/.test(this.value)
    },
    classObject() {
      let vm = this
      let m = /^([a-z]+)-(.+)$/.exec(vm.value)
      if(m) {
        return m[1] + ' ' + vm.value
      }
      return "material-icons"
    },
    styleObject() {
      let vm = this
      let re = {}
      if(vm.size) {
        re.fontSize = Ti.Css.toSize(vm.size)
      }
      if(vm.color) {
        re.color = vm.color
      }
      if(vm.opacity >=0 ) {
        re.opacity = vm.opacity
      }
      return re
    }
  }
}