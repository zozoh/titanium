export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "data" : {
      type : Array,
      default : ()=>[]
    },
    "itemIcon" : {
      type : String,
      default : null
    },
    "pathIcon" : {
      type : String,
      default : "zmdi-chevron-right"
    },
    "cancelItemBubble" : {
      type : Boolean,
      default : true
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      if(this.className)
        return this.className
    },
    //------------------------------------------------
    theData() {
      let list = []
      if(_.isArray(this.data)) {
        _.forEach(this.data, (val, index)=>{
          list.push(_.assign({
            icon    : this.itemIcon
          }, val, {index, atLast:index==this.data.length - 1}))
        })
      }
      return list
    },
    //------------------------------------------------
    theDataValues() {
      let list = []
      for(let it of this.theData) {
        list.push(Ti.Util.fallback(it.value, null))
      }
      return list
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onItemFired({index=-1}={}) {
      if(index >= 0) {
        let it = _.nth(this.theData, index)
        if(it) {
          this.$emit("item:actived", it)
        }
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}