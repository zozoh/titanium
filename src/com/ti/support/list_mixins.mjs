export default {
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
    topStyle() {
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
    theRowToggleKey() {
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
      for(let row of this.theData){
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
      return _.assign({}, Ti.Types, this.extendFunctionSet)
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
      for(let row of this.theData) {
        if(row.id == rowId) {
          return row.index
        }
      }
      return -1
    },
    //-----------------------------------------------
    findRowById(rowId) {
      for(let row of this.theData) {
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
    getCheckedRow(checkedIds=this.theCheckedIds) {
      let list = []
      for(let row of this.theData) {
        if(checkedIds[row.id]) {
          list.push(row)
        }
      }
      return list
    },
    //------------------------------------------
    getChecked(checkedIds=this.theCheckedIds) {
      let rows = this.getCheckedRow(checkedIds)
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
      for(let row of this.theData) {
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
      let theCheckedIds = {}
      let theCurrentId  = null
      
      // Change the current & checked
      if(this.autoCheckCurrent) {
        theCheckedIds = rowId ? {[rowId]:true} : {}
        theCurrentId  = rowId || null
      }
      // Just change to current
      else {
        theCheckedIds = _.cloneDeep(this.myCheckedIds)
        theCurrentId  = rowId
      }

      let emitContext = this.getEmitContext(theCurrentId, theCheckedIds)
      // Private Mode
      if(!this.puppetMode) {
        this.myCheckedIds = theCheckedIds
        this.myCurrentId  = theCurrentId
        this.myLastIndex  = this.findRowIndexById(rowId)
      }
      // Notify Changes
      if(!quiet) {
        _.defaults(emitContext, payload)
        this.$emit("selected", emitContext)
      }
    },
    //-----------------------------------------------
    selectRowByIndex(rowIndex, options) {
      //console.log(rowIndex)
      let index = rowIndex
      if(this.scrollIndex) {
        index = Ti.Num.scrollIndex(rowIndex, this.theData.length)
      }
      if(_.inRange(index, 0, this.theData.length)) {
        let row = this.theData[index]
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
      let theCheckedIds = _.cloneDeep(this.theCheckedIds)
      let theCurrentId  = this.theCurrentId
      let theIndex = this.findRowIndexById(rowId)
      if(theIndex >= 0) {
        let fromIndex = Math.min(theIndex, this.myLastIndex)
        let toIndex   = Math.max(theIndex, this.myLastIndex)
        if(fromIndex < 0) {
          fromIndex = 0
        }
        for(let i=fromIndex; i<=toIndex; i++) {
          let row = this.theData[i]
          theCheckedIds[row.id] = true
        }
        // Eval context
        let emitContext = this.getEmitContext(theCurrentId, theCheckedIds)
        // Private Mode
        if(!this.puppetMode) {
          this.myCheckedIds = theCheckedIds
          this.myCurrentId  = theCurrentId
          this.myLastIndex  = theIndex
        }
        // Notify Changes
        this.$emit("selected", emitContext)
      }
    },
    //-----------------------------------------------
    checkRow(rowId) {
      let theCheckedIds = _.cloneDeep(this.theCheckedIds)
      let theCurrentId  = this.theCurrentId
      let theIndex = this.myLastIndex
      // All rows
      if(_.isUndefined(rowId)) {
        theCheckedIds = {}
        _.forEach(this.theData, (row)=>{
          theCheckedIds[row.id] = true
        })
      }
      // Multi rows
      else if(_.isArray(rowId)) {
        let lastRowId = _.last(rowId)
        _.forEach(rowId, (r_id)=>{
          theCheckedIds[r_id] = true
        })
        if(this.autoCheckCurrent) {
          theIndex = this.findRowIndexById(lastRowId)
        }
      }
      // Single row
      else {
        theCheckedIds[rowId] = true
        if(this.autoCheckCurrent) {
          theIndex = this.findRowIndexById(rowId)
        }
      }
      // Eval context
      let emitContext = this.getEmitContext(theCurrentId, theCheckedIds)
      // Private Mode
      if(!this.puppetMode) {
        this.myCheckedIds = theCheckedIds
        this.myCurrentId  = theCurrentId
        this.myLastIndex  = theIndex
      }
      // Notify Changes
      this.$emit("selected", emitContext)
    },
    //-----------------------------------------------
    cancelRow(rowId) {
      let theCheckedIds = _.cloneDeep(this.theCheckedIds)
      let theCurrentId  = this.theCurrentId
      let theIndex = -1
      //console.log("cancelRow", rowId)
      if(_.isUndefined(rowId)) {
        theCheckedIds = {}
        theCurrentId = null
      }
      // Single row
      else {
        theIndex = this.findRowIndexById(rowId)
        theCheckedIds[rowId] = false
        if(this.autoCheckCurrent && theCurrentId == rowId) {
          theCurrentId = null
        }
      }
      // Eval context
      let emitContext = this.getEmitContext(theCurrentId, theCheckedIds)
      // Private Mode
      if(!this.puppetMode) {
        this.myCheckedIds = theCheckedIds
        this.myCurrentId  = theCurrentId
        this.myLastIndex  = theIndex
      }
      // Notify Changes
      this.$emit("selected", emitContext)
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
    onRowCheckerClick({rowId, shift}={}) {
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
    onRowSelect({rowId, shift, toggle}={}) {
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
    onRowOpen({rowId}={}) {
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