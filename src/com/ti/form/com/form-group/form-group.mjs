export default {
  inheritAttrs: false,
  ///////////////////////////////////////////
  computed : {
    //----------------------------------------
    topClass() {
      let klass = [`as-${this.viewportMode}`]
      if(this.className) {
        klass.push(this.className)
      }
      return klass
    },
    //----------------------------------------
    show() {
      return {
        title : this.title ? true : false,
        icon  : this.icon  ? true : false
      }
    }
    //----------------------------------------
  }
  ///////////////////////////////////////////
}