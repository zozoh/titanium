/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    theFields() {
      let list = []
      for(let fld of this.fields) {
        let f2 = _.assign({}, fld)
        f2.display = this.explainDisplayItems(fld.display)
        list.push(f2)
      }
      return list
    },
    //----------------------------------------------
    theExplainDict(){
      return async function(value, dict){
          return await Wn.Dict.getText(dict, value)
        }
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    onSelected(eventInfo) {
      //console.log("wn-table onSelected", eventInfo)
      this.$emit("selected", eventInfo)
    },
    //----------------------------------------------
    onOpen(eventInfo) {
      //console.log("wn-table onOpen", eventInfo)
      this.$emit("open", eventInfo)
    }
    //----------------------------------------------
  }
  ///////////////////////////////////////////////////
}