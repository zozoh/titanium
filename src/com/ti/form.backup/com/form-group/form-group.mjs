export default {
  ///////////////////////////////////////////
  computed : {
    //----------------------------------------
    TopClass() {
      let klass = [`as-${this.screenMode}`]
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