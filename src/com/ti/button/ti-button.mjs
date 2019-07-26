export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "size" :{
      type : String,
      default : "normal"
    },
    // center|top|left|right|bottom|
    // left-top|right-top|bottom-left|bottom-right
    "align" :{
      type : String,
      default : "center"
    },
    "className" :{
      type : [String, Object, Array],
      default : null
    },
    "setup" : {
      type : [Array, Object],
      default : []
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    topClass() {
      let klass = [`is-${this.size}`, `at-${this.align}`]
      if(this.className) {
        // String
        if(_.isString(this.className)) {
          klass.push(this.className)
        }
        // Array
        else if(_.isArray(this.className)) {
          for(let cn of this.className) {
            klass.push(cn)
          }
        }
        // Object
        else if(_.isPlainObject(this.className)) {
          _.forEach(this.className, (cn, isOn)=>{
            if(isOn)
              klass.push(cn)
          })
        }
      }
      return klass
    },
    //......................................
    items() {
      let list = [].concat(this.setup)
      let re = []
      _.forEach(list, (li, index)=>{
        let it = {}
        it.name = li.name || `item-${index}`
        it.icon = li.icon
        it.text = li.text
        it.disabled = li.disabled
        it.buttonClass = {
          [`as-${it.name}`] : true,
          "is-enabled"      : !li.disabled  ? true : false,
          "is-disabled"     : li.disabled   ? true : false,
          "is-invert-icon"  : li.invertIcon ? true : false 
        }
        re.push(it)
      })
      return re
    }
    //......................................
  },
  //////////////////////////////////////////
  methods :{
    onClickItem(it) {
      if(!it.disabled) {
        this.$emit(it.name)
      }
    }
  }
  //////////////////////////////////////////
}