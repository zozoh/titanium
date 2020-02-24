export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "data" : {
      type : Array,
      default : ()=>[]
    },
    "optionIcon" : {
      type : String,
      default : null
    },
    "cancelItemBubble" : {
      type : Boolean,
      default : true
    },
    "itemOptions" : {
      type : Array,
      default : ()=>[]
    },
    "itemIcon" : {
      type : String,
      default : null
    },
    "removeIcon" : {
      type : String,
      default : "zmdi-close"
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
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
            icon    : this.itemIcon,
            options : this.itemOptions
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
    onItemChanged(it={}) {
      if(it.index >= 0) {
        this.$emit("piece:changed", it)
        let values = _.concat(this.theDataValues)
        values[it.index] = Ti.Util.fallback(it.value, null)
        this.$emit("changed", values)
      }
    },
    //------------------------------------------------
    onItemRemoved({index=-1}={}) {
      if(index >= 0) {
        let values = _.remove(this.theDataValues, (v,i)=>i!=index)
        this.$emit("changed", values)
      }
    },
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