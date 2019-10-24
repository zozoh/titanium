export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    /***
     * Display mode
     * - box  : as label boxes
     * - path : as path like crumb
     */
    "mode" : {
      type : String,
      default : "box"
    },
    "optionIcon" : {
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
    },
    /***
     * Crumb Data `[{icon,text,value}]`
     */
    "data" : {
      type : Array,
      default : ()=>[]
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
      _.forEach(this.data, (val, index)=>{
        list.push(_.assign({}, val, {index}))
      })
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
    onPieceChanged(it={}) {
      if(it.index >= 0) {
        this.$emit("piece:changed", it)
        let values = _.concat(this.theDataValues)
        values[it.index] = Ti.Util.fallback(it.value, null)
        this.$emit("changed", values)
      }
    },
    //------------------------------------------------
    onPieceRemoved({index=-1}={}) {
      if(index >= 0) {
        let values = _.remove(this.theDataValues, (v,i)=>i!=index)
        this.$emit("changed", values)
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}