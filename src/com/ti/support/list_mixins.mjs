export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    myLastIndex: -1,      // The last row index selected by user
    myCurrentId: null,    // Current row ID
    myCheckedIds: {}      // Which row has been checked
  }),
  ///////////////////////////////////////////////////
  props : {
    "className" : null,
    "idBy" : {
      type : [String, Function],
      default : "id"
    },
    "rawDataBy" : {
      type : [Object, String, Function],
      default : _.identity
    },
    "className" : {
      type : String,
      default : null
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
      type : [Array, Object],
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
    "scrollIndex" : {
      type : Boolean,
      default : false
    },
    "blankAs" : {
      type : Object,
      default : ()=>({
        icon : "zmdi-alert-circle-o",
        text : "empty-data"
      })
    },
    "onReady" : {
      type : Function,
      default : null
    }
  },
  ///////////////////////////////////////////////////
  computed : {
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
    getRowId() {
      if(_.isFunction(this.idBy)) {
        return it => this.idBy(it)
      }
      return (it)=>_.get(it, this.idBy)
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
    theCurrentId()  {return this.puppetMode ? this.currentId : this.myCurrentId},
    theCheckedIds() {
      return this.puppetMode 
        ? this.getCheckedIdsMap(this.checkedIds)
        : this.myCheckedIds 
    },
    //--------------------------------------
    fnSet() {
      return _.assign({}, Ti.Types, this.extendFunctionSet)
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //--------------------------------------
    evalData(iteratee=_.identity) {
      let list = []
      _.forEach(this.data, (it, index)=>{
        let item = {
          index,
          id      : this.getRowId(it),
          rawData : this.getRowData(it),
          item : it
        }
        item = iteratee(item) || item
        // Join
        list.push(item)
      })
      return list
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
      let currentIndex = -1
      for(let row of this.theData) {
        if(row.id == currentId) {
          current = row.rawData
          currentIndex = row.index
        }
        if(checkedIds[row.id]) {
          selected.push(row.rawData)
        }
      }
      return {
        currentId, checkedIds, currentIndex,
        selected, current
      }
    },
    //--------------------------------------
    selectRow(rowId, quiet) {
      let theCheckedIds = rowId ? {[rowId]:true} : {}
      let theCurrentId  = rowId
      let emitContext = this.getEmitContext(theCurrentId, theCheckedIds)
      // Private Mode
      if(!this.puppetMode) {
        this.myCheckedIds = theCheckedIds
        this.myCurrentId  = theCurrentId
        this.myLastIndex  = this.findRowIndexById(rowId)
      }
      // Notify Changes
      if(!quiet) {
        this.$emit("selected", emitContext)
      }
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
      let theCheckedIds = _.cloneDeep(this.theCheckedIds)
      let theCurrentId  = this.theCurrentId
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
      let theCheckedIds = _.cloneDeep(this.theCheckedIds)
      let theCurrentId  = this.theCurrentId
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
      return idMap
    },
    //--------------------------------------
    syncCurrentId() {
      if(!this.puppetMode && this.myCurrentId != this.currentId) {
        //console.log("syncCurrentId", this.currentId)
        this.selectRow(this.currentId, true)
      }
      // Just update the last
      else {
        this.myLastIndex = this.findRowIndexById(this.currentId)
      }
    },
    //--------------------------------------
    syncCheckedIds() {
      if(!this.puppetMode) {
        this.myCheckedIds = this.getCheckedIdsMap(this.checkedIds)
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
    this.syncCheckedIds()
    this.syncCurrentId()
    //.................................
    if(_.isFunction(this.onReady)) {
      this.onReady.apply(this, [this])
    }
    //.................................
   }
  ///////////////////////////////////////////////////
}