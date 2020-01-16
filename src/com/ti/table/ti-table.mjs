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
    // select item
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
    theData() {
      let list = []
      _.forEach(this.data, (it, index)=>{
        list.push({
          index,
          id     : this.getRowId(it),
          indent : this.getRowIndent(it),
          data   : it
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
    theSelectedItems() {
      let list = []
      for(let it of this.theData) {
        if(this.myCheckedIds[it.id]) {
          list.push(it.data)
        }
      }
      return list
    },
    //--------------------------------------
    theCurrentItem() {
      for(let it of this.theData) {
        if(this.myCurrentId == it.id) {
          return it.data
        }
      }
    },
    //--------------------------------------
    theEmitContext() {
      return {
        selected   : this.theSelectedItems,
        current    : this.theCurrentItem,
        currentId  : this.myCurrentId,
        checkedIds : this.myCheckedIds
      }
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
    getRowId(row) {
      return Ti.Util.getOrPick(row, this.idBy)
    },
    //--------------------------------------
    getRowIndent(row) {
      return 0
    },
    //--------------------------------------
    getRowStatusIcon(row) {
      return null
    },
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
    selectRow(rowId) {
      this.myCheckedIds = {[rowId]:true}
      this.myCurrentId  = rowId
      this.myLastIndex  = this.findRowIndexById(rowId)
      // Notify Changes
      this.$emit("selected", this.theEmitContext)
    },
    //--------------------------------------
    selectRowsToCurrent(rowId) {
      let theIndex = this.findRowIndexById(rowId)
      if(theIndex >= 0) {
        let fromIndex = Math.min(theIndex, this.myLastIndex)
        let toIndex   = Math.max(theIndex, this.myLastIndex)
        if(fromIndex < 0) {
          fromIndex = 0
        }
        for(let i=fromIndex; i<=toIndex; i++) {
          let row = this.theData[i]
          this.checkRow(row.id)
        }
        // Notify Changes
        this.$emit("selected", this.theEmitContext)
      }
    },
    //--------------------------------------
    checkRow(rowId) {
      if(_.isUndefined(rowId)) {
        this.myCheckedIds = {}
        _.forEach(this.theData, (row)=>{
          this.myCheckedIds[row.id] = true
        })
      }
      // Single row
      else {
        this.$set(this.myCheckedIds, rowId, true)
      }
      // Notify Changes
      this.$emit("selected", this.theEmitContext)
    },
    //--------------------------------------
    cancelRow(rowId) {
      if(_.isUndefined(rowId)) {
        this.myCheckedIds = {}
        this.myCurrentId = null
        this.myLastIndex = 0
      }
      // Single row
      else {
        this.$set(this.myCheckedIds, rowId, false)
      }
      // Notify Changes
      //console.log("canceled", this.theEmitContext)
      this.$emit("selected", this.theEmitContext)
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
    onRowToggle({rowId, shift}={}) {
      console.log(rowId, shift)
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
    onItemChanged(it) {
      console.log(it)
    },
    //--------------------------------------
    evalFieldDisplay(displayItems=[]) {
      // Force to Array
      displayItems = _.concat(displayItems)
      // Prepare the return list
      let items = []
      // Loop each items
      for(let li of displayItems) {
        let m = /^<([^:>]*):([^>]+)>$/.exec(li)
        // Icon
        if(m) {
          items.push({
            key       : m[1] || Symbol(li),
            defaultAs : m[2],
            comType   : "ti-icon"
          })
        }
        // String|Array -> ti-label
        else if(_.isString(li) || _.isArray(li)) {
          items.push({
            key  : li,
            //type : "String",
            comType : "ti-label",
            comConf : {}
          })
        }
        // Plan Object
        else if(_.isPlainObject(li) && li.key){
          items.push(_.assign({
            //type    : li.type || "String",
            comType : "ti-label",
          }, li))
        }
        // Ignore others ...
      }
      // Gen uniqueKey and transformer for each item
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
      let colN = this.myColSizes.primary.length - 1
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
      // The first column
      this.myColSizes.amended.push(this.myColSizes.primary[0])
      // The fields column
      for(let i=1; i<this.myColSizes.primary.length; i++) {
        this.myColSizes.amended.push(this.myColSizes.primary[i] + remainCell)
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "currentId" : function() {
      this.myCurrentId = this.currentId
      this.myLastIndex = this.findRowIndexById(this.currentId)
    },
    "checkedIds" : function() {
      this.myCheckedIds = {}
      _.forEach(this.checkedIds, (rowId)=>{
        this.myCheckedIds[rowId] = true
      })
    }
  },
  ///////////////////////////////////////////////////
  mounted : async function() {
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