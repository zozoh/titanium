export default {
  props : {
    "value" : {
      type : [String,Object],
      default : ""
    },
    "size" : {
      type : [Number, String],
      default : "unset"
    },
    "color" : {
      type : String,
      default : ""
    },
    "opacity" : {
      type : Number,
      default : -1
    }
  },
  computed : {
    icon() {
      if(_.isPlainObject(this.value)){
        // Regular icon object, return it directly
        if(this.value.type && this.value.value) {
          return this.value
        }
        // Eval it as meta
        return Ti.Icons.get(this.value)
      }
      let re = {
        type : "font",
        value : this.value
      }
      if(_.isString(this.value)) {
        re.type = Ti.Util.getSuffixName(this.value) || "font"
      }
      // for image
      if(/^(jpe?g|gif|png)$/.test(re.type.toLowerCase())){
        re.type = "iimg"
      }

      return re
    },
    topStyle() {
      if("unset" == this.size) {
        return {}
      }
      let sz = Ti.Css.toSize(this.size)
      return {
        width  : sz, 
        height : sz
      }
    },
    fontIcon() {
      return Ti.Icons.parseFontIcon(this.icon.value)
    },
    fontStyle() {
      let vm = this
      let re = {}
      if(vm.size && "unset"!=vm.size) {
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
      if(vm.size && "unset"!=vm.size) {
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