export default {
  /////////////////////////////////////////
  props : {
    "icon": {
      type: [String, Object],
      default: undefined
    },
    "value": {
      type : [String, Number, Boolean, Array],
      default : undefined
    },
    "lineSeperater": {
      type : String,
      default: "\n"
    },
    "i18n": {
      type: Boolean,
      default: false
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    hasValue() {
      return Ti.Util.isNil(this.value) ? false : true;
    },
    //--------------------------------------
    TheValue() {
      // Split String
      if(_.isString(this.value)) {
        if(this.lineSeperater) {
          let ss = this.value.split(this.lineSeperater)
          _.map(ss, s => _.trim(s))
          return ss
        }
        return [this.value]
      }
      // Already Array
      if(_.isArray(this.value))
        return this.value
      
      // Others
      return [this.value]
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}