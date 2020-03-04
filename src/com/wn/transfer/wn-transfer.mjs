export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  data : ()=>({
    
  }),
  ///////////////////////////////////////////////////////
  props : {
    "itemBy" : {
      type : [String, Function],
      default : undefined
    },
    "findBy" : {
      type : [String, Function],
      default : undefined
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TheCanComType() {
      return this.canComType || "wn-list"
    },
    //---------------------------------------------------
    TheSelComType() {
      return this.selComType || "wn-list"
    },
    //------------------------------------------------
    TheDisplay() {
      return this.display || ["@<thumb>", "title", "nm"]
    },
    //---------------------------------------------------
    OptionsDict() {
      return Ti.DictFactory.CreateDict({
        //...............................................
        findAll : Wn.Util.genQuery(this.options),
        getItem : Wn.Util.genQuery(this.itemBy),
        find    : Wn.Util.genQuery(this.findBy),
        //...............................................
        getValue : Ti.Util.genGetter(this.valueBy || "id"),
        getText  : Ti.Util.genGetter(this.textBy  || "title|nm"),
        getIcon  : Ti.Util.genGetter(this.textBy  || "icon")
        //...............................................
      })
    }
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}