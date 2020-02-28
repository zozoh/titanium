/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    "iconBy" : {
      type : [String, Function],
      default : undefined
    },
    "indentBy" : {
      type : [String, Function],
      default : undefined
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
    // Delegate methods
    selectPrevRow(options){this.$list.selectPrevRow(options)},
    selectNextRow(options){this.$list.selectNextRow(options)}
    //----------------------------------------------
  }
  ///////////////////////////////////////////////////
}