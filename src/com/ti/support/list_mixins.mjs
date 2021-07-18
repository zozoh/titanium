const LIST_MIXINS = {
  ///////////////////////////////////////////////////
  provide : function(){
    return {
      "$vars" : this.vars || {}
    }
  },
  ///////////////////////////////////////////////////
  data : ()=>({
    myLastIndex: -1,      // The last row index selected by user
    myCurrentId: null,    // Current row ID
    myCheckedIds: {},     // Which row has been checked

    myMoreIsPendingAt   : -1,
    myMorePendingOffset : -1,
    myMorePendingExpectTop : -1,
    myMoreBtnOrgHeight  : -1
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
    testRowAsGroupTitle() {
      if(this.rowAsGroupTitle) {
        return Ti.AutoMatch.parse(this.rowAsGroupTitle)
      }
      return ()=>false
    },
    //-----------------------------------------------
    RowGroupTitleDisplay() {
      if(this.rowGroupTitleDisplay) {
        return this.evalFieldDisplay(this.rowGroupTitleDisplay, "..")
      }
    },
    //-----------------------------------------------
    isDataPending() {
      return Ti.Util.isNil(this.data)
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
    isRowCheckable () {return Ti.AutoMatch.parse(this.rowCheckable ||this.checkable)},
    isRowSelectable() {return Ti.AutoMatch.parse(this.rowSelectable||this.selectable)},
    isRowOpenable  () {return Ti.AutoMatch.parse(this.rowOpenable  ||this.openable)},
    isRowCancelable() {return Ti.AutoMatch.parse(this.rowCancelable||this.cancelable)},
    isRowHoverable () {return Ti.AutoMatch.parse(this.rowHoverable ||this.hoverable)},
    //-----------------------------------------------
    LoadingMoreBtn() {
      if(this.moreLoading) {
        return {
          icon : "fas-spinner fa-spin",
          text : "i18n:loading"
        }
      }
      if(this.myMorePendingExpectTop > 0) {
        return {
          icon : "fas-spinner fa-spin",
          text : "i18n:load-more-pull"
        }
      }
      return {
        icon : "fas-angle-down",
        text : "i18n:more"
      }
    },
    //-----------------------------------------------
    // fnSet() {
    //   return _.assign({}, Ti.GlobalFuncs(), this.extendFunctionSet)
    // },
    //-----------------------------------------------
    Dict() {
      if(this.dict) {
        // Already Dict
        if(this.dict instanceof Ti.Dict) {
          return this.dict
        }
        // Get back
        let {name} = Ti.DictFactory.explainDictName(this.dict)
        return Ti.DictFactory.CheckDict(name)
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    OnClickLoadMore() {
      //console.log("load more")
      if(!this.moreLoading && this.myMorePendingExpectTop<0) {
        this.$notify("load:more")
      }
    },
    //-----------------------------------------------
    wrapRowId(rowId) {
      if(_.isNumber(rowId)){
        return ""+rowId
      }
      return rowId
    },
    //-----------------------------------------------
    async evalData(iteratee=_.identity) {
      let data = this.data
      //............................................
      // May need translate
      if(this.Dict) {
        // Query by value
        if(_.isString(data)) {
          data = await this.Dict.queryData(data)
        }
        // Check Each data item
        else if(_.isArray(data)) {
          let data2 = []
          for(let i=0; i<data.length; i++) {
            let it = data[i]
            // Check the real item
            if(_.isString(it)) {
              let it2 = await this.Dict.getItem(it)
              if(it2) {
                data2.push(it2)
              }
            }
            // Primary
            else {
              data2.push(it)
            }
          }
          data = data2
        }
        // All data of Dict
        else {
          data = await this.Dict.getData()
        }
      }
      //............................................
      // Then format the list
      let list = []
      let displayIndex = 0
      _.forEach(data, (it, index)=>{
        let className;
        if(this.rowClassBy) {
          className = Ti.Util.explainObj(it, this.rowClassBy, {
            evalFunc: true
          })
        }
        let asGroupTitle = this.testRowAsGroupTitle(it)
        let item = {
          className, index, displayIndex, asGroupTitle,
          id      : this.getRowId(it, index),
          rawData : this.getRowData(it),
          checkable  : this.isRowCheckable(it),
          selectable : this.isRowSelectable(it),
          openable   : this.isRowOpenable(it),
          cancelable : this.isRowCancelable(it),
          hoverable  : this.isRowHoverable(it),
          item : it
        }
        item = iteratee(item) || item
        // Increase display index
        if(!asGroupTitle) {
          displayIndex++
        }
        // Join
        list.push(item)
      })
      //............................................
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
    //-----------------------------------------------
    getRow(index=0) {
      return _.nth(this.TheData, index)
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
    removeCheckedRow(idMap=this.theCheckedIds) {
      let checkedIds = this.getCheckedIdsMap(idMap, false)
      let minIndex = -1
      let maxIndex = -1
      let remainsRows = []
      let checkedRows = []

      _.forEach(this.TheData, row => {
        if(idMap[row.id]) {
          minIndex = minIndex < 0 
                      ? row.index
                      : Math.min(row.index, minIndex);

          maxIndex = maxIndex < 0
                      ? row.index
                      : Math.max(row.index, maxIndex);

          checkedRows.push(row)
        } else {
          remainsRows.push(row)
        }
      })

      return {
        remainsRows, checkedRows, minIndex, maxIndex, checkedIds
      }
    },
    //-----------------------------------------------
    removeChecked(idMap=this.theCheckedIds) {
      let re = this.removeCheckedRow(idMap)
      re.remains = _.map(re.remainsRows, row => row.rawData)
      re.checked = _.map(re.checkedRows, row => row.rawData)
      return re
    },
    //-----------------------------------------------
    moveCheckedRow(offset=0, idMap=this.theCheckedIds) {
      idMap = this.getCheckedIdsMap(idMap, false)
      //console.log(idMap)
      if(offset==0 || _.isEmpty(idMap))
        return {rows:this.TheData, nextCheckedIds:idMap}

      let {
        checkedIds,
        minIndex,
        maxIndex,
        remainsRows,
        checkedRows
      } = this.removeCheckedRow(idMap)

      // targetIndex in remains[] list
      let targetIndex = Math.max(0, minIndex-1)
      if(offset > 0) {
        targetIndex = Math.min(maxIndex - checkedRows.length + 2, remainsRows.length)
      }
      // Insert
      let rows = _.cloneDeep(remainsRows)
      rows.splice(targetIndex, 0, ...checkedRows)

      if(_.isEmpty(rows))
        return {rows:[], nextCheckedIds:{}}

      // If the index style ID, adjust them
      let nextCheckedIds = checkedIds
      if(/^Row-\d+$/.test(rows[0].id)) {
        nextCheckedIds = {}
        for(let i=0; i<checkedRows.length; i++){
          nextCheckedIds[`Row-${i + targetIndex}`] = true
        }
      }

      return {rows, nextCheckedIds}
    },
    //-----------------------------------------------
    moveChecked(offset=0, idMap=this.theCheckedIds) {
      let re = this.moveCheckedRow(offset, idMap)
      re.list = _.map(re.rows, row => row.rawData)
      return re
    },
    //-----------------------------------------------
    getEmitContext(
      currentId, 
      checkedIds={}
    ) {
      let checked = []
      let current = null
      let currentIndex = -1
      let currentDisplayIndex = -1
      for(let row of this.TheData) {
        if(row.id == currentId) {
          current = row.rawData
          currentIndex = row.index
          currentDisplayIndex = row.displayIndex
        }
        if(checkedIds[row.id]) {
          checked.push(row.rawData)
        }
      }
      return {
        currentIndex, currentDisplayIndex,
        current, currentId, 
        checked, checkedIds
      }
    },
    //-----------------------------------------------
    async canSelectRow(payload) {
      if(_.isFunction(this.onBeforeChangeSelect)) {
        let canSelect = await this.onBeforeChangeSelect(payload)
        if(false === canSelect) {
          return false
        }
      }
      return true
    },
    //-----------------------------------------------
    async selectRow(rowId, {quiet=false, payload}={}) {
      //console.log("list_mixins:selectRow", rowId)
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

      if(!(await this.canSelectRow(emitContext))) {
        return;
      }

      // Private Mode
      if(!this.puppetMode) {
        this.myCheckedIds = idMap
        this.myCurrentId  = curId
      }
      this.myLastIndex  = this.findRowIndexById(rowId)
      // Notify Changes
      if(!quiet) {
        _.defaults(emitContext, payload)
        this.doNotifySelect(emitContext)
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
        }
        this.myLastIndex  = index
        // Notify Changes
        this.doNotifySelect(emitContext)
      }
    },
    //-----------------------------------------------
    checkRow(rowId, {quiet=false, payload, reset=false}={}) {
      let idMap = _.cloneDeep(this.theCheckedIds)
      let curId = this.theCurrentId
      let index = this.myLastIndex
      let rowIndex = this.findRowIndexById(rowId)

      // Reset
      if(reset) {
        curId = null
        idMap = {}
      }

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
      if(!this.puppetMode) {
        this.myCheckedIds = idMap
        this.myCurrentId  = curId
      }
      this.myLastIndex  = rowIndex
      // Notify Changes
      if(!quiet) {
        _.defaults(emitContext, payload)
        this.doNotifySelect(emitContext)
      }
    },
    //-----------------------------------------------
    async cancelRow(rowId, {quiet=false, payload}={}) {
      let idMap = _.cloneDeep(this.theCheckedIds)
      let curId  = this.theCurrentId
      let index = -1
      //console.log("cancelRow", rowId)
      if(Ti.Util.isNil(rowId)) {
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
      if(!this.puppetMode) {
        this.myCheckedIds = idMap
        this.myCurrentId  = curId
        this.myLastIndex  = index
      }
      // Notify Changes
      if(!quiet) {
        _.defaults(emitContext, payload)
        this.doNotifySelect(emitContext)
      }
    },
    //-----------------------------------------------
    toggleRow(rowId, {quiet=false, payload}={}) {
      if(this.theCheckedIds[rowId]) {
        this.cancelRow(rowId, {quiet, payload})
      } else {
        this.checkRow(rowId, {quiet, payload})
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
      console.log("OnRowOpen", rowId)
      let row = this.findRowById(rowId)
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
    getCheckedIdsMap(idList=[], autoCheckCurrent=this.autoCheckCurrent) {
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
      if(autoCheckCurrent && !Ti.Util.isNil(this.theCurrentId)) {
        idMap[this.theCurrentId] = true
      }
      return idMap
    },
    //-----------------------------------------------
    setRowSelect({currentId, checkedIds={}, quiet}={}) {
      console.log("haha")
      let idMap = {}
      if(_.isArray(checkedIds)) {
        for(let id of checkedIds) {
          idMap[id] = true
        }
      } else {
        _.assign(idMap, checkedIds)
      }

      if(currentId) {
        this.selectRow(currentId, {quiet})
      } else {
        this.cancelRow(currentId, {quiet})
      }
      this.myCheckedIds = idMap
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
    },
    //-----------------------------------------------
    resetMorePending({$more, $moreBtn}={}) {
      this.myMoreIsPendingAt = -1
      this.myMorePendingOffset = -1
      this.myMorePendingExpectTop = -1
      this.myMoreBtnOrgHeight = -1
      if(_.isElement($more)) {
        Ti.Dom.updateStyle($more, {
          "margin-bottom": ""
        })
      }
      if(_.isElement($moreBtn)) {
        Ti.Dom.updateStyle($moreBtn, {
          height: ""
        })
      }
    },
    //-----------------------------------------------
    pendingMoreWhenScrolling({$view, $more, $moreBtn}={}) {
      // Not more
      if(this.moreLoading 
        || !this.autoLoadMore 
        || !_.isElement($more) 
        || !_.isElement($moreBtn)
      ) {
        return
      }
      // Get the more position
      let view  = Ti.Rects.createBy($view)
      let vsTop = $view.scrollTop
      let viewH = $view.scrollHeight
      // Pending more
      if(this.myMoreIsPendingAt > 0) {
        // Cancel pendding
        if(vsTop < this.myMoreIsPendingAt) {
          //console.log("cancel pending")
          this.resetMorePending({$more,$moreBtn})
        }
        // Add pending
        else {
          let orgH = this.myMoreBtnOrgHeight
          let off = Math.min(orgH*2, vsTop - this.myMoreIsPendingAt)
          this.myMorePendingOffset = off
          let btnH = Math.max(orgH, off)
          Ti.Dom.updateStyle($moreBtn, {
            height: btnH
          })
          // Reach the bottom check delay
          if(this.myMorePendingExpectTop<=0 && Math.ceil(view.height+vsTop) >= viewH) {
            this.myMorePendingExpectTop = vsTop
            //console.log("check in 500ms")
            _.delay(()=>{
              let expTop = this.myMorePendingExpectTop
              if(expTop>0 && $view.scrollTop >= expTop) {
                //console.log("fire load more!")
                this.$notify("load:more")
                this.resetMorePending({$more,$moreBtn})
              }
            }, 500)
          }
        }
        return
      }

      // Detact pending
      let more = Ti.Rects.createBy($more)
      let moin = view.contains(more, -3)
      //console.log(moin, vsTop, view.toString(), more.toString())
      if(moin) {
        this.myMoreIsPendingAt = vsTop
        this.myMoreBtnOrgHeight = $moreBtn.clientHeight
        Ti.Dom.updateStyle($more, {
          "margin-bottom": this.myMoreBtnOrgHeight * 2
        })
      } else {
        this.resetMorePending({$more,$moreBtn})
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