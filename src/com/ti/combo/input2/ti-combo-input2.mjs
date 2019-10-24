export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "status"     : "collapse",
    "loading"    : false,
    "listValue"  : undefined,
    "listData"   : [],
    "listLoaded" : false
  }),
  ////////////////////////////////////////////////////
  // props @see ./input-props.mjs
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      let klass = []
      if(this.className) {
        klass.push(this.className)
      }
      return klass
    },
    //------------------------------------------------
    isInputMode()    {return "input"   ==this.mode},
    isMultiMode()    {return "multi"   ==this.mode},
    isDroplistMode() {return "droplist"==this.mode},
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted : function() {
    
  }
  ////////////////////////////////////////////////////
}