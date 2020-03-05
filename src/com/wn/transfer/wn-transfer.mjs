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
        data  : Wn.Util.genQuery(this.options),
        query : Wn.Util.genQuery(this.findBy),
        item  : Wn.Util.genQuery(this.itemBy),
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