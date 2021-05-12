export default {
  inheritAttrs : false,
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
      if(this.loading && this.prefixIcon) {
        return this.loadingIcon
      }
      return this.prefixIcon
    },
    //---------------------------------------------------
    OptionsDict() {
      return Wn.Dict.evalOptionsDict(this, ({loading}) => {
        this.loading = loading
      })
    },
    //------------------------------------------------
    TheTagMapping() {
      if(!_.isEmpty(this.tagMapping)) {
        return this.tagMapping
      }
      return {
        text  : "title|text|nm",
        icon  : "icon",
        value : "id|value"
      }
    },
    //------------------------------------------------
    TheTagItemIconBy() {
      return this.tagItemIconBy
               || (meta => Wn.Util.getObjIcon(meta, this.tagItemDefaultIcon))
     },
    //---------------------------------------------------
    TheDropDisplay() {
      return this.dropDisplay || ["@<thumb>", "title", "nm"]
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}