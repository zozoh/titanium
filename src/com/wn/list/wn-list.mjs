/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    isAllChecked  : false,
    hasChecked    : false,
    theCurrentId  : false,
    theCheckedIds : false
  }),
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
    DisplayItems() {
      return this.explainDisplayItems(this.display)
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    OnSubListInit($list) {this.$list = $list},
    //----------------------------------------------
    OnSelected(payload={}){
      this.theCheckedIds = payload.checkedIds
      this.theCurrentId  = payload.currentId
      this.syncCheckStatus()
      this.$notify("select", payload)
    },
    //----------------------------------------------
    syncCheckStatus() {
      this.isAllChecked = this.$list.isAllChecked
      this.hasChecked   = this.$list.hasChecked
    },
    //----------------------------------------------
    // Delegate methods
    selectPrevRow(options){this.$list.selectPrevRow(options)},
    selectNextRow(options){this.$list.selectNextRow(options)},

    getCurrentRow(options){return this.$list.getCurrentRow(options)},
    getCheckedRow(options){return this.$list.getCheckedRow(options)},

    getCurrent(options){return this.$list.getCurrent(options)},
    getChecked(options){return this.$list.getChecked(options)},

    selectRow(options){this.$list.selectRow(options)},
    checkRow (options){this.$list.checkRow(options)},
    cancelRow(options){this.$list.cancelRow(options)}
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "data" : function(){
      this.syncCheckStatus()
    },
    "checkedIds" : function(){
      this.syncCheckStatus()
    }
  }
  ///////////////////////////////////////////////////
}