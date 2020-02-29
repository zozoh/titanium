export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "loading" : false,
    "myOptions"  : [],
    "myItem" : null
  }),
  ////////////////////////////////////////////////////
  // props 
  props : {
    // String: "@dict:xxx" or "obj ~/* -lcqn"
    // if command, inputing will be take as input
    //             and ${inputing} was supported
    // if function, `(inputing):Array`
    "options" : {
      type : [String, Array, Function],
      default : null
    },
    // string command or function to handle inputing
    "query" : {
      type : [String, Function],
      default : null
    },
    // pick icon from options item for emit value changed
    "itemIconBy" : {
      type : [String, Function],
      default : ()=>function(it, dftIcon){
        return Wn.Util.getObjIcon(it, dftIcon)
      }
    },
    "loadingIcon" : {
      type : String,
      default : "zmdi-settings zmdi-hc-spin"
    },
    // If dynamic, eval delay in millisecond
    "delay" : {
      type : Number,
      default : 800
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    getItemIcon() {
      if(_.isFunction(this.itemIconBy)) {
        return it => this.itemIconBy(it)
      }
      if(_.isString(this.itemIconBy)) {
        return it => _.get(it, this.itemIconBy)
      }
      return it => null
    },
    //------------------------------------------------
    thePrefixIcon() {
      if(this.loading) {
        return this.loadingIcon
      }
      if(this.myItem) {
        return this.getItemIcon(this.myItem, this.prefixIcon)
      }
      return this.prefixIcon
    },
    //------------------------------------------------
    theFormat() {
      return this.format || "${title|nm}"
    },
    //------------------------------------------------
    theValueBy() {
      return this.valueBy || "id"
    },
    //------------------------------------------------
    theMatchBy() {
      return this.matchBy || ["id","nm","title"]
    },
    //------------------------------------------------
    theDropDisplay() {
      return this.dropDisplay || ["@<thumb>", "title", "nm"]
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    onInputItemChagned(item) {
      this.myItem = item
    },
    //-----------------------------------------------
    onInputInputing(val) {
      if(_.isFunction(this.debounceEvalOptions)) {
        this.debounceEvalOptions(val)
      }
    },
    //-----------------------------------------------
    async evalOptions(query, val) {
      this.loading = true
      this.myOptions = await Wn.Util.queryBy(query, val)
      this.loading = false
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  created : function() {
    if(this.query) {
      this.debounceEvalOptions = _.debounce(val=>{
        this.evalOptions(this.query, val)
      }, this.delay)
    }
  },
  ////////////////////////////////////////////////////
  mounted : async function() {
    await this.evalOptions(this.options)
  }
  ////////////////////////////////////////////////////
}