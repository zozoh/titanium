export default {
  //-----------------------------------------------
  OnDblClickRow(row={}) {
    let rowId = row.id
    row = this.findRowById(rowId)
    if(row) {
      if(this.notifyOpenName) {
        this.$notify(this.notifyOpenName, row)
      }
      if(_.isFunction(this.onOpen)) {
        this.onOpen(row)
      }
    }
  },
  //-----------------------------------------------
  OnClickRow(row, $event) {
    let rowId  = row.id
    let shift  = $event.shiftKey
    let toggle = ($event.ctrlKey || $event.metaKey)
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
  OnClickRowChecker(row, $event) {
    let rowId  = row.id
    let shift  = $event.shiftKey
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
  //--------------------------------------
  OnClickHeadChecker() {
    // Cancel All
    if(this.isAllChecked) {
      this.cancelRow()
    }
    // Check All
    else {
      this.checkRow()
    }
  },
  //-----------------------------------------------
  // Publis methods
  //-----------------------------------------------
  toggleRow(rowId) {
    if(this.myCheckedIds[rowId]) {
      this.cancelRow(rowId)
    } else {
      this.checkRow(rowId)
    }
  },
  canSelectRow(payload) {
    if(_.isFunction(this.onBeforeChangeSelect)) {
      let canSelect = this.onBeforeChangeSelect(payload)
      if(false === canSelect) {
        return false
      }
    }
    return true
  },
  //-----------------------------------------------
  checkRow(rowId) {
    let idMap = _.cloneDeep(this.myCheckedIds)
    let curId = this.myCurrentId
    let index = this.myLastIndex
    let rowIndex = this.findRowIndexById(rowId)
    // All rows
    if(_.isUndefined(rowId)) {
      idMap = {}
      _.forEach(this.TableData, (row)=>{
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
    // Object
    else if(_.isPlainObject(rowId)) {
      idMap = _.cloneDeep(rowId)
      if(this.autoCheckCurrent) {
        let lastRowId = undefined
        for(let key in idMap) {
          lastRowId = key
          break;
        }
        index = this.findRowIndexById(lastRowId)
      }
    }
    // Single row
    else {
      idMap[rowId] = true
      if(this.autoCheckCurrent) {
        index = rowIndex
      }
    }
    // Eval context
    let emitContext = this.getEmitContext(curId, idMap)
    // Private Mode
    this.myCheckedIds = idMap
    this.myCurrentId  = curId
    this.myLastIndex  = rowIndex
    // Notify Changes
    this.doNotifySelect(emitContext)
  },
  //-----------------------------------------------
  async cancelRow(rowId) {
    let idMap = _.cloneDeep(this.myCheckedIds)
    let curId  = this.myCurrentId
    let index = -1
    //this.LOG("cancelRow", rowId)
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

    if(!(await this.canSelectRow(emitContext))) {
      return;
    }

    // Private Mode
    this.myCheckedIds = idMap
    this.myCurrentId  = curId
    this.myLastIndex  = index
    // Notify Changes
    this.doNotifySelect(emitContext)
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

    if(!(this.canSelectRow(emitContext))) {
      return;
    }

    this.myCheckedIds = idMap
    this.myCurrentId  = curId
    this.myLastIndex  = this.findRowIndexById(rowId)
    // Notify Changes
    if(!quiet) {
      _.defaults(emitContext, payload)
      this.doNotifySelect(emitContext)
    }
  },
  //-----------------------------------------------
  selectRowByIndex(rowIndex, options) {
    //this.LOG(rowIndex)
    let index = rowIndex
    if(this.scrollIndex) {
      index = Ti.Num.scrollIndex(rowIndex, this.TableData.length)
    }
    if(_.inRange(index, 0, this.TableData.length)) {
      let row = this.TableData[index]
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
    let idMap = _.cloneDeep(this.myCheckedIds)
    let curId = this.myCurrentId
    let index = this.findRowIndexById(rowId)
    if(index >= 0) {
      let fromIndex = Math.min(index, this.myLastIndex)
      let toIndex   = Math.max(index, this.myLastIndex)
      if(fromIndex < 0) {
        fromIndex = 0
      }
      for(let i=fromIndex; i<=toIndex; i++) {
        let row = this.TableData[i]
        idMap[row.id] = true
      }
      // Eval context
      let emitContext = this.getEmitContext(curId, idMap)
      // Private Mode
      if(!this.puppetMode) {
        this.myCheckedIds = idMap
        this.myCurrentId  = curId
      }
      this.myLastIndex  = index
      // Notify Changes
      this.doNotifySelect(emitContext)
    }
  },
  //-----------------------------------------------
  getEmitContext(
    currentId, 
    checkedIds={}
  ) {
    let checked = []
    let current = null
    let currentIndex = -1
    for(let row of this.TableData) {
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
  doNotifySelect(emitContext) {
    if(this.notifySelectName) {
      this.$notify(this.notifySelectName, emitContext)
    }
    if(_.isFunction(this.onSelect)) {
      this.onSelect(emitContext)
    }
  }
  //-----------------------------------------------
}