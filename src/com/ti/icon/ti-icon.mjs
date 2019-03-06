export default {
  props : {
    type : {
      type : String,
      default : "font"
    },
    value : {
      type : String,
      default : ""
    },
    data :{
      type : Object,
      default : ()=>({
        type  : "font",
        value : "zmdi-dribbble"
      })
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
    isFont() {
      return this.data.type == "font"
    },
    isFontLiga() {
      let val = this.fontValue
      return !/^([a-z]+)-/.test(val)
    },
    fontValue() {
      return this.value || this.data.value
    },
    fontClassObject() {
      let val = this.fontValue
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
    }
  }
}