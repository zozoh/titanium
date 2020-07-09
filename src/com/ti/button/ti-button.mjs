const _M = {
  /////////////////////////////////////////
  props : {
    "size" :{
      type : String,
      default : "normal",
      validator: v=>/^(big|normal|small|tiny)$/.test(v)
    },
    // center|top|left|right|bottom|
    // left-top|right-top|bottom-left|bottom-right
    "align" :{
      type : String,
      default : "center"
    },
    "setup" : {
      type : [Array, Object],
      default : ()=>[]
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    topClass() {
      return Ti.Css.mergeClassName([
        `is-${this.size}`, `at-${this.align}`
      ], this.className)
    },
    //......................................
    items() {
      let list = [].concat(this.setup)
      let re = []
      _.forEach(list, (li, index)=>{
        let it = {}
        it.name = li.name || `item-${index}`
        it.eventName = li.eventName || it.name
        it.payload = li.payload
        it.icon = li.icon
        it.text = li.text
        it.disabled = li.disabled
        it.handler = li.handler
        it.buttonClass = {
          [`as-do-${it.name}`] : true,
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
    OnClickItem(it) {
      if(!it.disabled) {
        if(_.isFunction(it.handler)) {
          it.handler()
        }
        if(_.isString(it.eventName)) {
          this.$notify(it.eventName, it.payload)
        }
      }
    }
  }
  //////////////////////////////////////////
}
export default _M;