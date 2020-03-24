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
  computed : {
    //----------------------------------------------
    TheFields() {
      let list = []
      for(let fld of this.fields) {
        let f2 = _.assign({}, fld)
        f2.display = this.explainDisplayItems(fld.display)
        list.push(f2)
      }
      return list
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