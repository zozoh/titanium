export default {
  props : {
    value : {
      type : [String,Object],
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
    icon() {
      if(_.isPlainObject(this.value)){
        return Ti.Icons.get(this.value)
      }
      let re = {
        type : "font",
        value : this.value
      }
      if(_.isString(this.value)) {
        re.type = Ti.Util.getSuffixName(this.value) || "font"
      }
      return re
    },
    isFontLiga() {
      let icon = this.icon
      if("font" == icon.type)
        return !/^([a-z]+)-/.test(icon.value)
      return false
    },
    fontClassObject() {
      let val = this.icon.value
      let m = /^([a-z]+)-(.+)$/.exec(val)
      if(m) {
        // fontawsome
        if(/^fa[a-z]$/.test(m[1])) {
          return m[1] + ' fa-' + m[2]
        }
        // Other font libs
        return m[1] + ' ' + val
      }
      return "material-icons"
    },
    fontStyleObject() {
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
    },
    imgStyleObject() {
      let vm = this
      let re = {}
      if(vm.size) {
        re.width = Ti.Css.toSize(vm.size)
        re.height = re.width
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