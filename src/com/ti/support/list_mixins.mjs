const LIST_MIXINS = {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    myLastIndex: -1,      // The last row index selected by user
    myCurrentId: null,    // Current row ID
    myCheckedIds: {}      // Which row has been checked
  }),
  ///////////////////////////////////////////////////
  // props -> list_props.mjs
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopStyle() {
      let w = this.width
      let h = this.height
      return Ti.Css.toStyle({
        width  : w,
        height : h
      })
    },
    //-----------------------------------------------
    hasRowToggleKey() {
      return !_.isEmpty(this.rowToggleKey)
    },
    //-----------------------------------------------
    TheRowToggleKey() {
      return _.without(_.concat(this.rowToggleKey), undefined)
    },
    //-----------------------------------------------
    getRowId() {
      return Ti.Util.genRowIdGetter(this.idBy)
    },
    //-----------------------------------------------
    getRowData() {
      return Ti.Util.genRowDataGetter(this.rawDataBy)
    },
    //-----------------------------------------------
    isDataEmpty() {
      return !_.isArray(this.data) || _.isEmpty(this.data)
    },
    //-----------------------------------------------
    isAllChecked() {
      // Empty list, nothing checked
      if(this.isDataEmpty) {
        return false 
      }
      // Checking ...
      for(let row of this.TheData){
        if(!this.theCheckedIds[row.id])
          return false;  
      }
      return true
    },
    //-----------------------------------------------
    hasChecked() {
      for(let it of this.data){
        let itId = this.getRowId(it)
        if(this.theCheckedIds[itId])
          return true  
      }
      return false
    },
    //-----------------------------------------------
    theCurrentRowId() {
      return this.wrapRowId(this.currentId)
    },
    //-----------------------------------------------
    theCurrentId()  {
      return this.puppetMode 
              ? this.theCurrentRowId 
              : this.myCurrentId
    },
    //-----------------------------------------------
    theCheckedIds() {
      return this.puppetMode 
        ? this.getCheckedIdsMap(this.checkedIds)
        : this.myCheckedIds 
    },
    //-----------------------------------------------
    fnSet() {
      return _.assign({}, Ti.GlobalFuncs(), this.extendFunctionSet)
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    wrapRowId(rowId) {
      if(_.isNumber(rowId)){
        return ""+rowId
      }
      return rowId
    },
    //-----------------------------------------------
    evalData(iteratee=_.identity) {
      let list = []
      _.forEach(this.data, (it, index)=>{
        let item = {
          index,
          id      : this.getRowId(it, index),
          rawData : this.getRowData(it),
          item : it
        }
        item = iteratee(item) || item
        // Join
        list.push(item)
      })
      return list
    },
    //-----------------------------------------------
    findRowIndexById(rowId) {
      for(let row of this.TheData) {
        if(row.id == rowId) {
          return row.index
        }
      }
      return -1
    },
    //-----------------------------------------------
    findRowById(rowId) {
      for(let row of this.TheData) {
        if(row.id == rowId) {
          return row
        }
      }
    },
    //------------------------------------------
    getCurrentRow(currentId=this.theCurrentId) {
      return this.findRowById(currentId)
    },
    //------------------------------------------
    getCurrent(currentId=this.theCurrentId) {
      let row = this.getCurrentRow(currentId)
      return row 
              ? row.rawData
              : null
    },
    //------------------------------------------
    getCheckedRow(idMap=this.theCheckedIds) {
      let list = []
      for(let row of this.TheData) {
        if(idMap[row.id]) {
          list.push(row)
        }
      }
      return list
    },
    //------------------------------------------
    getChecked(idMap=this.theCheckedIds) {
      let rows = this.getCheckedRow(idMap)
      return _.map(rows, row=>row.rawData)
    },
    //-----------------------------------------------
    getEmitContext(
      currentId, 
      checkedIds={}
    ) {
      let checked = []
      let current = null
      let currentIndex = -1
      for(let row of this.TheData) {
        if(row.id == currentId) {
          current = row.rawData
          currentIndex = row.index
        }
        if(checkedIds[row.id]) {
          checked.push(row.rawData)
        }
      }
      return {
        current, currentId, currentIndex,
        checked, checkedIds
      }
    },
    //-----------------------------------------------
    selectRow(rowId, {quiet=false, payload}={}) {
      let idMap = {}
      let curId = null
      
      // Change the current & checked
      if(this.autoCheckCurrent) {
        idMap = rowId ? {[rowId]:true} : {}
        curId = rowId || null
      }
      // Just change to current
      else {
        idMap = _.cloneDeep(this.myCheckedIds)
        curId = rowId
      }

      let emitContext = this.getEmitContext(curId, idMap)
      // Private Mode
      if(!this.puppetMode) {
        this.myCheckedIds = idMap
        this.myCurrentId  = curId
        this.myLastIndex  = this.findRowIndexById(rowId)
      }
      // Notify Changes
      if(!quiet) {
        _.defaults(emitContext, payload)
        this.$emit("select", emitContext)
      }
    },
    //-----------------------------------------------
    selectRowByIndex(rowIndex, options) {
      //console.log(rowIndex)
      let index = rowIndex
      if(this.scrollIndex) {
        index = Ti.Num.scrollIndex(rowIndex, this.TheData.length)
      }
      if(_.inRange(index, 0, this.TheData.length)) {
        let row = this.TheData[index]
        this.selectRow(row.id, options)
      }
    },
    //-----------------------------------------------
    selectPrevRow(options) {
      this.selectRowByIndex(Math.max(-1, this.myLastIndex-1), options)
    },
    //-----------------------------------------------
    selectNextRow(options) {
      this.selectRowByIndex(this.myLastIndex+1, options)
    },
    //-----------------------------------------------
    selectRowsToCurrent(rowId) {
      let idMap = _.cloneDeep(this.theCheckedIds)
      let curId = this.theCurrentId
      let index = this.findRowIndexById(rowId)
      if(index >= 0) {
        let fromIndex = Math.min(index, this.myLastIndex)
        let toIndex   = Math.max(index, this.myLastIndex)
        if(fromIndex < 0) {
          fromIndex = 0
        }
        for(let i=fromIndex; i<=toIndex; i++) {
          let row = this.TheData[i]
          idMap[row.id] = true
        }
        // Eval context
        let emitContext = this.getEmitContext(curId, idMap)
        // Private Mode
        if(!this.puppetMode) {
          this.myCheckedIds = idMap
          this.myCurrentId  = curId
          this.myLastIndex  = index
        }
        // Notify Changes
        this.$emit("select", emitContext)
      }
    },
    //-----------------------------------------------
    checkRow(rowId) {
      let idMap = _.cloneDeep(this.theCheckedIds)
      let curId = this.theCurrentId
      let index = this.myLastIndex
      // All rows
      if(_.isUndefined(rowId)) {
        idMap = {}
        _.forEach(this.TheData, (row)=>{
          idMap[row.id] = true
        })
      }
      // Multi rows
      else if(_.isArray(rowId)) {
        let lastRowId = _.last(rowId)
        _.forEach(rowId, (r_id)=>{
          idMap[r_id] = true
        })
        if(this.autoCheckCurrent) {
          index = this.findRowIndexById(lastRowId)
        }
      }
      // Single row
      else {
        idMap[rowId] = true
        if(this.autoCheckCurrent) {
          index = this.findRowIndexById(rowId)
        }
      }
      // Eval context
      let emitContext = this.getEmitContext(curId, idMap)
      // Private Mode
      if(!this.puppetMode) {
        this.myCheckedIds = idMap
        this.myCurrentId  = curId
        this.myLastIndex  = index
      }
      // Notify Changes
      this.$emit("select", emitContext)
    },
    //-----------------------------------------------
    cancelRow(rowId) {
      let idMap = _.cloneDeep(this.theCheckedIds)
      let curId  = this.theCurrentId
      let index = -1
      //console.log("cancelRow", rowId)
      if(_.isUndefined(rowId)) {
        idMap = {}
        curId = null
      }
      // Single row
      else {
        index = this.findRowIndexById(rowId)
        idMap[rowId] = false
        if(this.autoCheckCurrent && curId == rowId) {
          curId = null
        }
      }
      // Eval context
      let emitContext = this.getEmitContext(curId, idMap)
      // Private Mode
      if(!this.puppetMode) {
        this.myCheckedIds = idMap
        this.myCurrentId  = curId
        this.myLastIndex  = index
      }
      // Notify Changes
      this.$emit("select", emitContext)
    },
    //-----------------------------------------------
    toggleRow(rowId) {
      if(this.theCheckedIds[rowId]) {
        this.cancelRow(rowId)
      } else {
        this.checkRow(rowId)
      }
    },
    //-----------------------------------------------
    OnRowCheckerClick({rowId, shift}={}) {
      if(this.multi) {
        // Shift Mode
        if(shift) {
          this.selectRowsToCurrent(rowId)
        }
        // Simple Toggle Mode
        else {
          this.toggleRow(rowId)
        }
      }
      // Single Mode
      else {
        this.selectRow(rowId)
      }
    },
    //-----------------------------------------------
    OnRowSelect({rowId, shift, toggle}={}) {
      // Multi + Shift Mode
      if(shift && this.multi) {
        this.selectRowsToCurrent(rowId)
      }
      // Multi + Toggle Mode
      else if(toggle && this.multi) {
        this.toggleRow(rowId)
      }
      // Toggle Mode
      else if(!Ti.Util.isNil(rowId) && !this.autoCheckCurrent) {
        this.toggleRow(rowId)
      }
      // Single Mode
      else {
        this.selectRow(rowId)
      }
    },
    //-----------------------------------------------
    OnRowOpen({rowId}={}) {
      let row = this.findRowById(rowId)
      if(row) {
        this.$emit("open", row)
      }
    },
    //-----------------------------------------------
    getCheckedIdsMap(idList=[]) {
      let idMap = {}
      // ID List
      if(_.isArray(idList)) {
        _.forEach(idList, (rowId)=>{
          idMap[rowId] = true
        })
      }
      // Map
      else {
        _.forEach(idList, (checked, rowId)=>{
          if(checked) {
            idMap[rowId] = true
          }
        })
      }
      // Force to check current
      if(this.autoCheckCurrent && !Ti.Util.isNil(this.theCurrentId)) {
        idMap[this.theCurrentId] = true
      }
      return idMap
    },
    //-----------------------------------------------
    syncCurrentId() {
      if(!this.puppetMode && this.theCurrentId != this.theCurrentRowId) {
        //console.log("syncCurrentId", this.theCurrentRowId)
        this.selectRow(this.theCurrentRowId, {quiet:true})
      }
      // Just update the last
      else {
        this.myLastIndex = this.findRowIndexById(this.theCurrentRowId)
      }
    },
    //-----------------------------------------------
    syncCheckedIds() {
      if(!this.puppetMode) {
        this.myCheckedIds = this.getCheckedIdsMap(this.checkedIds)
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "currentId" : function() {
      this.syncCurrentId()
    },
    "checkedIds" : function() {
      this.syncCheckedIds()
    },
    "data" : function() {
      if(this.theCurrentId) {
        this.myLastIndex = this.findRowIndexById(this.theCurrentId)
      }
    }
  },
  ///////////////////////////////////////////////////
  mounted : async function() {
    //.................................
    this.syncCheckedIds()
    this.syncCurrentId()
    //.................................
   }
  ///////////////////////////////////////////////////
}
export default LIST_MIXINS