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
      default : 500
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
    },
    //------------------------------------------------
    theTagMapping() {
      if(!_.isEmpty(this.tagMapping)) {
        return this.tagMapping
      }
      return {
        text  : "title|nm",
        icon  : "icon",
        value : "id"
      }
    },
    //------------------------------------------------
    theTagItemIconBy() {
      if(!_.isUndefined(this.tagItemIconBy)) {
        return this.tagItemIconBy
      }
      return (meta)=>{
        return Wn.Util.getObjIcon(meta)
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    onInputInputing(val) {
      if(_.isFunction(this.debounceEvalOptions)) {
        this.debounceEvalOptions(val)
      }
    },
    //-----------------------------------------------
    async evalOptions(query, val) {
      //.............................................
      // Mark loading
      this.loading = true

      //.............................................
      // Eval: Array
      if(_.isArray(query)) {
        this.myOptions = query
      }
      // Eval: Command || Dict
      else if(_.isString(query)) {
        let m = /^@dict:(.+)$/.exec(query)
        // Dict
        if(m) {
          let dict = _.trim(m[1])
          this.myOptions = await Wn.Dict.getAll(dict)
        }
        // Command
        else {
          let cmdText = Ti.S.renderBy(query, {inputing:val})
          this.myOptions = await Wn.Sys.exec2(cmdText, {
            as : "json",
            input : val
          })
        }
      }
      // Eval: Function
      else if(_.isFunction(query)) {
        this.myOptions = await query(val)
      }

      //.............................................
      // Unmark loading
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