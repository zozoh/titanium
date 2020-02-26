/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    "iconBy" : {
      type : [String, Function],
      default : null
    },
    "indentBy" : {
      type : [String, Function],
      default : null
    },
    "itemClassName" : undefined,
    "display" : {
      type : [Object, String, Array],
      default : ()=>({
        key : "..",
        comType : "ti-label"
      })
    },
    "border" : {
      type : Boolean,
      default : true
    },
    "autoScrollIntoView" : {
      type : Boolean,
      default : true
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //----------------------------------------------
    theDisplayItems() {
      return this.explainDisplayItems(this.display)
    },
    //----------------------------------------------
    theExplainDict(){
      return async function(value, dict){
          return await Wn.Dict.get(dict, value)
        }
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    onSubListInit($list) {this.$list = $list},
    //----------------------------------------------
    onSelected(eventInfo) {
      //console.log("wn-table onSelected", eventInfo)
      this.$emit("selected", eventInfo)
    },
    //----------------------------------------------
    onOpen(eventInfo) {
      //console.log("wn-table onOpen", eventInfo)
      this.$emit("open", eventInfo)
    },
    //----------------------------------------------
    // Delegate methods
    selectPrevRow(){this.$list.selectPrevRow()},
    selectNextRow(){this.$list.selectNextRow()}
    //----------------------------------------------
  }
  ///////////////////////////////////////////////////
}