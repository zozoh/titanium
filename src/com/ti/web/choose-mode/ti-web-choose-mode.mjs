export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  props : {
    "base" : {
      type : String,
      default : null
    },
    "options" : {
      type : Array,
      default : ()=>[]
    },
    "value" : {
      type : String,
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    theItems() {
      let list = []
      for(let it of this.options) {
        list.push(_.assign({}, it, {
          className : _.isEqual(this.value, it.value)
            ? "is-current" : "is-others"
        }))
      }
      return list
    }
    //......................................
  },
  //////////////////////////////////////////
  methods : {
    //......................................
    onClickItem(it) {
      this.$emit("change", it.value)
    }
    //......................................
  }
  //////////////////////////////////////////
}