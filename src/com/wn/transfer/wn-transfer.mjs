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
      return Wn.Dict.evalOptionsDict(this)
    }
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}