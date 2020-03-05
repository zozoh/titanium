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
      return Ti.DictFactory.CreateDict({
        //...............................................
        data  : Wn.Util.genQuery(this.options),
        query : Wn.Util.genQuery(this.findBy),
        item  : Wn.Util.genQuery(this.itemBy),
        //...............................................
        getValue : Ti.Util.genGetter(this.valueBy || "id"),
        getText  : Ti.Util.genGetter(this.textBy  || "title|nm"),
        getIcon  : Ti.Util.genGetter(this.textBy  || "icon"),
        //...............................................
        hooks : ({loading}) => {
          this.loading = loading
        }
        //...............................................
      })
    },
    //------------------------------------------------
    TheTagMapping() {
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
    TheTagItemIconBy() {
      return this.tagItemIconBy
               || (meta => Wn.Util.getObjIcon(meta))
     },
    //---------------------------------------------------
    TheDropDisplay() {
      return this.dropDisplay || ["@<thumb>", "title", "nm"]
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}