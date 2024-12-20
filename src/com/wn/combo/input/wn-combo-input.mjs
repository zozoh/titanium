export default {
  ////////////////////////////////////////////////////
  data : ()=>({
    loading : false
  }),
  ////////////////////////////////////////////////////
  // props 
  props : {
    "itemBy" : {
      type : [String, Function],
      default : undefined
    },
    "findBy" : {
      type : [String, Function],
      default : undefined
    },
    "loadingIcon" : {
      type : String,
      default : "zmdi-settings zmdi-hc-spin"
    },
    "canInput" : {
      type : Boolean,
      default : true
    },
    "autoCollapse" : {
      type : Boolean,
      default : false
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    DropComType() {
      return this.dropComType || "wn-list"
    },
    //------------------------------------------------
    ThePrefixIcon() {
      if(this.loading) {
        return this.loadingIcon
      }
      return this.prefixIcon
    },
    //---------------------------------------------------
    OptionsDict() {
      if(this.dictKey) {
        console.log("haha", this)
      }
      return Wn.Dict.evalOptionsDict(this, ({loading}) => {
        this.loading = loading
      })
    },
    //---------------------------------------------------
    TheDropDisplay() {
      return this.dropDisplay || ["@<thumb>", "title|text"]
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}