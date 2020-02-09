export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    myLastIndex: -1,      // The last row index selected by user
    myCurrentId: null,    // Current row ID
    myHoverId  : null,    // The row mouse hover
    myCheckedIds: {},     // Which row has been checked
    myViewportWidth : 0,  // Update-in-time, root element width
    myTableWidth: 0,      // Update-in-time, table width
    myColSizes: {
      priHead : [],  // Primary head column sizing
      priBody : [],  // Primary body column sizing
      primary : [],  // Primary Max Col-Sizes
      fixeds  : [],  // Fixed value [480, .23, 'auto', 'stretch']
                     // Eval when `evalEachColumnSize`
                     //  - 480 : fixed width
                     //  - -480 : fixed width and override primary
                     //  - .23 : as percent eval each time resize
                     //  - 'auto' : it will keep the primary sizing
                     //  - 'stretch' : it will join to the auto-remains-assignment
      amended : []   // The col-size to display in DOM
    },
    whenTableLayout: false, 
  }),
  ///////////////////////////////////////////////////
  props : {
    "idBy" : {
      type : [String, Function],
      default : "id"
    },
    "rawDataBy" : {
      type : [Object, String, Function],
      default : _.identity
    },
    "iconBy" : {
      type : [String, Function],
      default : null
    },
    "indentBy" : {
      type : [String, Function],
      default : null
    },
    "className" : {
      type : String,
      default : null
    },
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    "explainDict" : {
      type : Function,
      default : _.identity
    },
    "extendFunctionSet" : {
      type : Object,
      default : ()=>({})
    },
    "data" : {
      type : Array,
      default : ()=>[]
    },
    "changedId" : {
      type : String,
      default : null
    },
    "currentId" : {
      type : String,
      default : null
    },
    "checkedIds" : {
      type : Array,
      default : ()=>[]
    },
    "multi" : {
      type : Boolean,
      default : false
    },
    "checkable" : {
      type : Boolean,
      default : false
    },
    "selectable" : {
      type : Boolean,
      default : true
    },
    "openable" : {
      type : Boolean,
      default : true
    },
    "cancelable" : {
      type : Boolean,
      default : true
    },
    "hoverable" : {
      type : Boolean,
      default : false
    },
    "puppetMode" : {
      type : Boolean,
      default : false
    },
    "width" : {
      type : [Number, String],
      default : null
    },
    "height" : {
      type : [Number, String],
      default : null
    },
    "head" : {
      type : String,
      default : "frozen",
      validator : v =>
        Ti.Util.isNil(v) 
        || /^(frozen|none|normal)$/.test(v)
    },
    "border" : {
      type : String,
      default : "column",
      validator : v => /^(row|column|cell|none)$/.test(v)
    },
    "autoScrollIntoView" : {
      type : Boolean,
      default : true
    },
    "scrollIndex" : {
      type : Boolean,
      default : false
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-self-actived" : this.isSelfActived,
        "is-actived"     : this.isActived,
        "is-when-layout" : this.whenTableLayout,
        "is-hoverable"   : this.hoverable
      }, [
        `is-border-${this.border}`,
        `is-head-${this.head||"none"}`,
      ], this.className)
    },
    //--------------------------------------
    topStyle() {
      let w = this.width
      let h = this.height
      return Ti.Css.toStyle({
        width  : w,
        height : h
      })
    },
    //--------------------------------------
    tableStyle() {
      if(this.myTableWidth>0) {
        return Ti.Css.toStyle({
          "width" : this.myTableWidth
        })
      }
    },
    //--------------------------------------
    getRowId() {
      if(_.isFunction(this.idBy)) {
        return it => this.idBy(it)
      }
      return (it)=>_.get(it, this.idBy)
    },
    //--------------------------------------
    getRowIndent() {
      if(_.isFunction(this.indentBy)) {
        return it => this.indentBy(it)
      }
      if(_.isString(this.indentBy)) {
        return it => _.get(it, this.indentBy)
      }
      return it => 0
    },
    //--------------------------------------
    getRowIcon() {
      if(_.isFunction(this.iconBy)) {
        return it => this.iconBy(it)
      }
      if(_.isString(this.iconBy)) {
        return it => _.get(it, this.iconBy)
      }
      return it => null
    },
    //--------------------------------------
    getRowData() {
      if(_.isFunction(this.rawDataBy)) {
        return it => this.rawDataBy(it)
      }
      if(_.isString(this.rawDataBy)) {
        return it => _.get(it, this.rawDataBy)
      }
      if(_.isObject(this.rawDataBy)) {
        return it => Ti.Util.mapping(it, this.rawDataBy)
      }
      return _.identity
    },
    //--------------------------------------
    theData() {
      let list = []
      _.forEach(this.data, (it, index)=>{
        list.push({
          index,
          id      : this.getRowId(it),
          icon    : this.getRowIcon(it),
          indent  : this.getRowIndent(it),
          rawData : this.getRowData(it)
        })
      })
      return list
    },
    //--------------------------------------
    isShowHead() {
      return /^(frozen|normal)$/.test(this.head)
    },
    //--------------------------------------
    isDataEmpty() {
      return !_.isArray(this.data) || _.isEmpty(this.data)
    },
    //--------------------------------------
    isAllChecked() {
      // Empty list, nothing checked
      if(this.isDataEmpty) {
        return false 
      }
      // Checking ...
      for(let row of this.theData){
        if(!this.myCheckedIds[row.id])
          return false;  
      }
      return true
    },
    //--------------------------------------
    hasChecked() {
      for(let it of this.data){
        let itId = this.getRowId(it)
        if(this.myCheckedIds[itId])
          return true  
      }
      return false
    },
    //--------------------------------------
    theHeadCheckerIcon() {
      if(this.isAllChecked) {
        return "fas-check-square"
      }
      if(this.hasChecked) {
        return "fas-minus-square"
      }
      return "far-square"
    },
    //--------------------------------------
    fnSet() {
      return _.assign({}, Ti.Types, this.extendFunctionSet)
    },
    //--------------------------------------
    theDisplayFields() {
      let fields = []
      for(let i=0; i< this.fields.length; i++) {
        let fld = this.fields[i]
        let display = this.evalFieldDisplay(fld.display)
        let fldWidth = Ti.Util.fallbackNil(fld.width, "stretch")
        //..................................
        if(_.isString(fldWidth)) {
          if(!/^(auto|stretch)$/.test(fldWidth)) {
            fldWidth = "stretch"
          }
        }
        // Must be number
        else if(!_.isNumber(fldWidth)) {
          fldWidth = "stretch"
        }
        //..................................
        fields.push({
          index  : i,
          title  : fld.title,
          nowrap : fld.nowrap,
          width  : fldWidth,
          display
        })
      }
      return fields
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //--------------------------------------
    headCellStyle(index=-1) {
      if(this.myColSizes.amended.length > index) {
        return Ti.Css.toStyle({
          "width" : this.myColSizes.amended[index]
        })
      }
    },
    //--------------------------------------
    findRowIndexById(rowId) {
      for(let row of this.theData) {
        if(row.id == rowId) {
          return row.index
        }
      }
      return -1
    },
    //--------------------------------------
    findRowById(rowId) {
      for(let row of this.theData) {
        if(row.id == rowId) {
          return row
        }
      }
    },
    //--------------------------------------
    getEmitContext(
      currentId, 
      checkedIds={}
    ) {
      let selected = []
      let current = null
      for(let row of this.theData) {
        if(row.id == currentId) {
          current = row.rawData
        }
        if(checkedIds[row.id]) {
          selected.push(row.rawData)
        }
      }
      return {
        currentId, checkedIds,
        selected, current
      }
    },
    //--------------------------------------
    selectRow(rowId) {
      let theCheckedIds = {[rowId]:true}
      let theCurrentId  = rowId
      let emitContext = this.getEmitContext(theCurrentId, theCheckedIds)
      // Private Mode
      if(!this.puppetMode) {
        this.myCheckedIds = theCheckedIds
        this.myCurrentId  = theCurrentId
        this.myLastIndex  = this.findRowIndexById(rowId)
      }
      // Notify Changes
      this.$emit("selected", emitContext)
    },
    //--------------------------------------
    selectRowByIndex(rowIndex) {
      //console.log(rowIndex)
      let index = rowIndex
      if(this.scrollIndex) {
        index = Ti.Num.scrollIndex(rowIndex, this.theData.length)
      }
      if(_.inRange(index, 0, this.theData.length)) {
        let row = this.theData[index]
        this.selectRow(row.id)
      }
    },
    //--------------------------------------
    selectPrevRow() {
      this.selectRowByIndex(Math.max(-1, this.myLastIndex-1))
    },
    //--------------------------------------
    selectNextRow() {
      this.selectRowByIndex(this.myLastIndex+1)
    },
    //--------------------------------------
    selectRowsToCurrent(rowId) {
      let theCheckedIds = _.cloneDeep(this.myCheckedIds)
      let theCurrentId  = this.myCurrentId
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
    //--------------------------------------
    checkRow(rowId) {
      let theCheckedIds = _.cloneDeep(this.myCheckedIds)
      let theCurrentId  = this.myCurrentId
      let theIndex = 0
      if(_.isUndefined(rowId)) {
        theCheckedIds = {}
        _.forEach(this.theData, (row)=>{
          theCheckedIds[row.id] = true
        })
      }
      // Single row
      else {
        theIndex = this.findRowIndexById(rowId)
        theCheckedIds[rowId] = true
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
    //--------------------------------------
    cancelRow(rowId) {
      let theCheckedIds = _.cloneDeep(this.myCheckedIds)
      let theCurrentId  = this.myCurrentId
      let theIndex = -1
      if(_.isUndefined(rowId)) {
        theCheckedIds = {}
        theCurrentId = null
      }
      // Single row
      else {
        theIndex = this.findRowIndexById(rowId)
        theCheckedIds[rowId] = false
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
    //--------------------------------------
    toggleRow(rowId) {
      if(this.myCheckedIds[rowId]) {
        this.cancelRow(rowId)
      } else {
        this.checkRow(rowId)
      }
    },
    //--------------------------------------
    onRowCheckerClick({rowId, shift}={}) {
      //console.log(rowId, shift)
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
    onRowSelect({rowId, shift, toggle}={}) {
      // Multi + Shift Mode
      if(shift && this.multi) {
        this.selectRowsToCurrent(rowId)
      }
      // Multi + Toggle Mode
      else if(toggle && this.multi) {
        this.toggleRow(rowId)
      }
      // Single Mode
      else {
        this.selectRow(rowId)
      }
    },
    //--------------------------------------
    onRowOpen({rowId}={}) {
      let row = this.findRowById(rowId)
      if(row) {
        this.$emit("open", row)
      }
    },
    //--------------------------------------
    onRowEnter({rowId}={}) {
      if(this.hoverable) {
        this.myHoverId = rowId
      }
    },
    //--------------------------------------
    onRowLeave({rowId}={}) {
      if(this.hoverable) {
        if(this.myHoverId == rowId) {
          this.myHoverId = null
        }
      }
    },
    //--------------------------------------
    onClickHeadChecker() {
      // Cancel All
      if(this.isAllChecked) {
        this.cancelRow()
      }
      // Check All
      else {
        this.checkRow()
      }
    },
    //--------------------------------------
    onClickTop($event) {
      if(this.cancelable) {
        // Click The body or top to cancel the row selection
        if(Ti.Dom.hasOneClass($event.target,
            'ti-table', 'table-body',
            'table-head-cell',
            'table-head-cell-text')) {
          this.cancelRow()
        }
      }
    },
    //--------------------------------------
    onItemChanged(payload) {
      this.$emit("item:changed", payload)
    },
    //--------------------------------------
    evalFieldDisplay(displayItems=[]) {
      // Force to Array
      displayItems = _.concat(displayItems)
      // Prepare the return list
      let items = []
      // Loop each items
      for(let li of displayItems) {
        let item = this.evalFieldDisplayItem(li)
        if(item) {
          items.push(item)
        }
      }
      // Gen transformer for each item
      for(let it of items) {
        // Transformer
        it.transformer = Ti.Types.getFuncBy(it, "transformer", this.fnSet)
      }
      // Array to pick
      return items
    },
    //--------------------------------------
    evalEachColumnSize() {
      // Reset each column size
      this.whenTableLayout = true
      this.myTableWidth = 0
      this.myColSizes = {
        priHead : [],
        priBody : [],
        primary : [],
        fixeds  : [],
        amended : []
      }
      //.........................................
      // Eval the fixeds
      for(let fld of this.theDisplayFields) {
        let fldWidth = fld.width || "stretch"
        // Stretch/Auto
        if(/^(stretch|auto)$/.test(fldWidth)) {
          this.myColSizes.fixeds.push(fldWidth)
        }
        // Fixed or percent
        else {
          this.myColSizes.fixeds.push(Ti.Css.toPixel(fldWidth, 1))
        }
      }
      //.........................................
      // Wait reset applied, and ...
      this.$nextTick(()=>{
        this.whenTableLayout = false
        // Get original size: head
        let $heads = Ti.Dom.findAll(".table-head ul li", this.$el)
        for(let $he of $heads) {
          let rect = Ti.Rects.createBy($he)
          this.myColSizes.priHead.push(rect.width)
        }

        // Get original size: body
        let $rows = Ti.Dom.findAll(".table-body .table-row", this.$el)
        for(let $row of $rows) {
          let $cells = Ti.Dom.findAll(":scope > div", $row)
          for(let x=0; x<$cells.length; x++) {
            let $cell = $cells[x]
            let rect = Ti.Rects.createBy($cell)
            if(x>= this.myColSizes.priBody.length) {
              this.myColSizes.priBody[x] = rect.width
            } else {
              this.myColSizes.priBody[x] = Math.max(
                rect.width, this.myColSizes.priBody[x]
              )
            }
          }
        }

        // Count the primary max sizing for each columns
        for(let i=0; i<this.myColSizes.priHead.length; i++) {
          let wHeadCell = this.myColSizes.priHead[i]
          let wBodyCell = this.myColSizes.priBody[i]
          let w = Math.max(wHeadCell, wBodyCell)
          this.myColSizes.primary.push(w)
        }

        // Resize Table
        this.onTableResize()
      })
    },
    //--------------------------------------
    onTableResize() {
      // Guard it
      let colN = this.myColSizes.primary.length
      if(colN <= 0) {
        return
      }

      // Get the viewport width
      let viewportWidth = Ti.Rects.createBy(this.$el).width

      // Assign the fixed width
      // And count how many fields to join the remains-assignment
      let raIndexs = [];
      let amended = []
      for(let i=0; i<this.myColSizes.fixeds.length; i++) {
        let fxW = this.myColSizes.fixeds[i]
        // Get the primary width
        let priW = this.myColSizes.primary[i]
        // join to auto-remains-assignment
        if("stretch" == fxW) {
          raIndexs.push(i)
          amended.push(priW)
        }
        // keep primary
        else if("auto" == fxW) {
          amended.push(priW)
        }
        // Eval percent
        else if(fxW <= 1 && fxW > 0) {
          amended.push(fxW * viewportWidth)
        }
        // Eval percent and join remains-assignment
        else if(fxW < 0 && fxW >= -1) {
          let w = Math.abs(fxW * viewportWidth)
          amended.push(Math.max(w, priW))
        }
        // Fixed width and join remains-assignment
        else if(fxW < -1) {
          let w = Math.abs(fxW)
          amended.push(Math.max(w, priW))
        }
        // Fixed width
        else {
          amended.push(fxW)
        }
      }

      // Count the tableWidth
      let sumWidth = _.sum(amended)
      let tableWidth = Math.max(viewportWidth, sumWidth)
      this.myTableWidth = tableWidth

      // Assign the remain
      if(raIndexs.length > 0) {
        let remain = tableWidth - sumWidth
        if(remain > 0) {
          let remainCell = remain / raIndexs.length
          for(let index of raIndexs) {
            amended[index] += remainCell
          }
        }
      }

      // apply amended
      this.myColSizes.amended = amended
    },
    //--------------------------------------
    syncCurrentId() {
      this.myCurrentId = this.currentId
      this.myLastIndex = this.currentId
        ? this.findRowIndexById(this.currentId)
        : -1
    },
    //--------------------------------------
    syncCheckedIds() {
      this.myCheckedIds = {}
      _.forEach(this.checkedIds, (rowId)=>{
        this.myCheckedIds[rowId] = true
      })
    },
    //--------------------------------------
    scrollCurrentIntoView() {
      if(this.autoScrollIntoView && this.myLastIndex>=0) {
        let $tbody = this.$refs.body
        let $row = Ti.Dom.find(`.table-row:nth-child(${this.myLastIndex+1})`, $tbody)

        let tbody = Ti.Rects.createBy($tbody)
        let row = Ti.Rects.createBy($row)

        // test it need to scroll or not
        if(!tbody.contains(row)) {
          // at bottom
          if(row.bottom > tbody.bottom) {
            $tbody.scrollTop += row.bottom - tbody.bottom
          }
          // at top
          else {
            $tbody.scrollTop += row.top - tbody.top
          }
        }
      }
    },
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-table", uniqKey)
      if("ARROWUP" == uniqKey) {
        this.selectPrevRow()
        this.scrollCurrentIntoView()
        return {prevent:true}
      }

      if("ARROWDOWN" == uniqKey) {
        this.selectNextRow()
        this.scrollCurrentIntoView()
        return {prevent:true}
      }
    }
    //--------------------------------------
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
    this.syncCurrentId()
    this.syncCheckedIds()
    //.................................
    // Define the method for sub-cells up-calling
    this.debounceEvalEachColumnSize = _.debounce(()=>this.evalEachColumnSize(), 100)
    //.................................
    Ti.Viewport.watch(this, {
      resize : _.debounce(()=>this.onTableResize(), 100)
    })
    //.................................
  },
  ///////////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////////////////////
}