const _M = {
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
    selectPrevRow(options){return this.$list.selectPrevRow(options)},
    selectNextRow(options){return this.$list.selectNextRow(options)},

    getCurrentRow(options){return this.$list.getCurrentRow(options)},
    getCheckedRow(options){return this.$list.getCheckedRow(options)},

    getCurrent(options){return this.$list.getCurrent(options)},
    getChecked(options){return this.$list.getChecked(options)},

    selectRow(options){return this.$list.selectRow(options)},
    checkRow (options){return this.$list.checkRow(options)},
    cancelRow(options){return this.$list.cancelRow(options)},

    removeCheckedRow(idMap){return this.$list.removeCheckedRow(idMap)},
    removeChecked(idMap){return this.$list.removeChecked(idMap)},

    moveCheckedRow(offset, idMap){return this.$list.moveCheckedRow(offset, idMap)},
    moveChecked(offset, idMap){return this.$list.moveChecked(offset, idMap)},
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
export default _M;