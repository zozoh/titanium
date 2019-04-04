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
    fontIcon() {
      return Ti.Icons.parseFontIcon(this.icon.value)
    },
    fontStyle() {
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
    imgStyle() {
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