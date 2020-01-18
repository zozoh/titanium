export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    myLastIndex: 0,       // The last row index selected by user
    myCurrentId: null,    // Current row ID
    myCheckedIds: {},     // Which row has been checked
    myViewportWidth : 0,  // Update-in-time, root element width
    myTableWidth: 0,      // Update-in-time, table width
    myColSizes: {
      priHead : [],  // Primary head column sizing
      priBody : [],  // Primary body column sizing
      primary : [],  // Primary Max Col-Sizes
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
    "cancelable" : {
      type : Boolean,
      default : true
    },
    "hoverable" : {
      type : Boolean,
      default : true
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
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName([
        `is-border-${this.border}`,
        `is-head-${this.head||"none"}`,
      ], {
        "is-when-layout" : this.whenTableLayout,
        "is-hoverable"   : this.hoverable
      },this.className)
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
        fields.push({
          index  : i,
          title  : fld.title,
          nowrap : fld.nowrap,
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
      let theIndex = 0
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
      // Shift Mode
      if(shift) {
        this.selectRowsToCurrent(rowId)
      }
      // Toggle Mode
      else if(toggle) {
        this.toggleRow(rowId)
      }
      // Single Mode
      else {
        this.selectRow(rowId)
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
    onClickBody() {
      if(this.cancelable) {
        this.cancelRow()
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
        let m = /^<([^:>]*)(:([^>]+))?>$/.exec(li)
        // Icon
        if(m) {
          items.push({
            key       : m[1] || Symbol(li),
            defaultAs : m[3] || undefined,
            comType   : "ti-icon"
          })
          continue
        }
        // String|Array -> ti-label
        if(_.isString(li) || _.isArray(li)) {
          m = /^([^+-]+)(([+-])>(.+))?$/.exec(li)
          let key  = _.trim(m[1] || m[0])
          let newTab = m[3] == "+"
          let href = _.trim(m[4])
          items.push({
            key,
            comType : "ti-label",
            comConf : {
              newTab, href
            }
          })
          continue
        }
        // Plan Object
        if(_.isPlainObject(li) && li.key){
          items.push(_.assign({
            comType : "ti-label",
          }, li))
        }
        // Ignore others ...
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
      this.myTableWidth = 0
      this.myColSizes = {
        priHead : [],
        priBody : [],
        primary : [],
        amended : []
      }
      // Wait reset applied, and ...
      this.$nextTick(()=>{
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

      // Count the tableWidth
      let sumWidth = _.sum(this.myColSizes.primary)
      let tableWidth = Ti.Rects.createBy(this.$el).width
      tableWidth = Math.max(tableWidth, sumWidth)
      this.myTableWidth = tableWidth

      // Assign the remain
      this.myColSizes.amended = []
      let remain = tableWidth - sumWidth
      let remainCell = remain / colN

      // The fields column
      for(let i=0; i<this.myColSizes.primary.length; i++) {
        this.myColSizes.amended.push(this.myColSizes.primary[i] + remainCell)
      }
    },
    //--------------------------------------
    syncCurrentId() {
      this.myCurrentId = this.currentId
      this.myLastIndex = this.currentId
        ? this.findRowIndexById(this.currentId)
        : 0
    },
    //--------------------------------------
    syncCheckedIds() {
      this.myCheckedIds = {}
      _.forEach(this.checkedIds, (rowId)=>{
        this.myCheckedIds[rowId] = true
      })
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