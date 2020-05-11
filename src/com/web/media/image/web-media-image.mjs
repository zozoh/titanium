export default {
  /////////////////////////////////////////
  props : {
    "base": {
      type: String,
      default: undefined
    },
    "src" : {
      type : String,
      default : undefined
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    ImgSrc() {
      return Ti.Util.appendPath(this.base, this.src)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}