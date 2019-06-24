function __find_each_col_size($div) {
  let list = []
  let $cells = Ti.Dom.findAll(":scope > .table-row > li", $div)
  for(let $cell of $cells) {
    let orgWidth = $cell.getAttribute("org-width")
    if(orgWidth) {
      list.push({
        fixed : $cell.hasAttribute("col-fixed"),
        size  : orgWidth * 1
      })
    }
    // Re-count
    else {
      let bcr = $cell.getBoundingClientRect()
      $cell.setAttribute("org-width", bcr.width)
      list.push({
        fixed : $cell.hasAttribute("col-fixed"),
        size  : bcr.width
      })
    }
  }
  return list
}
function __clean_each_col_size($div) {
  let $cells = Ti.Dom.findAll(":scope > .table-row > li", $div)
  for(let $cell of $cells) {
    $cell.removeAttribute("org-width")
  }
}
/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    viewportWidth : 0,
    colSizes : [],
    lastIndex  : 0,
    currentId  : null,
    checkedIds : {}
  }),
  ///////////////////////////////////////////////////
  props : {
    "idKey" : {
      type : String,
      default : "id"
    },
    //
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    // The list to be rendered
    "list" : {
      type : Array,
      default : ()=>[]
    },
    // Indicate which row has been change
    // The value should be the row[idKey]
    "changedId" : {
      type : String,
      default : null
    },
    // multi-selectable
    // effected when selectable is true
    "multi" : {
      type : Boolean,
      default : false
    },
    "checkable" : {
      type : Boolean,
      default : false
    },
    "blurable" : {
      type : Boolean,
      default : true
    },
    "border" : {
      type : Boolean,
      default : true
    },
    // select item
    "selectable" : {
      type : Boolean,
      default : true
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //--------------------------------------
    isEmpty() {
      return this.list.length == 0
    },
    //--------------------------------------
    colSumWidth() {
      let sum = 0
      for(let col of this.colSizes) {
        sum += col.size
      }
      return sum
    },
    //--------------------------------------
    colFixedWidth() {
      let sum = 0
      for(let col of this.colSizes) {
        if(col.fixed)
          sum += col.size
      }
      return sum
    },
    //--------------------------------------
    colDynamicWidth() {
      let sum = 0
      for(let col of this.colSizes) {
        if(!col.fixed)
          sum += col.size
      }
      return sum
    },
    //--------------------------------------
    formedColSizes() {
      let sum = this.colDynamicWidth
      let list = []
      if(this.colSizes.length > 0) {
        for(let col of this.colSizes) {
          list.push({
            fixed   : col.fixed,
            size    : col.size,
            percent : col.size / sum
          })
        }
      }
      return list
    },
    //--------------------------------------
    tableWidth() {
      return Math.max(this.colSumWidth, this.viewportWidth)
    },
    //--------------------------------------
    tableDynamicWidth() {
      return this.tableWidth - this.colFixedWidth
    },
    //--------------------------------------
    tableStyle() {
      let css = {}
      if(this.colSumWidth <= 0) {
        return css
      }

      let tableWidth = Math.max(this.viewportWidth, this.colSumWidth)
      if(tableWidth > 0) {
        css.width = tableWidth
        //console.log("tableStyle", css, Ti.Css.toStyle(css))
      }
      return Ti.Css.toStyle(css)
    },
    //--------------------------------------
    topClass() {
      let klass = []
      if(this.border) {
        klass.push("show-border")
      }
      if(!_.isEmpty(klass))
        return klass.join(" ")
    },
    //--------------------------------------
    isAllChecked() {
      // Empty list, nothing checked
      if(_.isEmpty(this.list)) 
        return false 
      // Checking ...
      for(let it of this.list){
        let itId = it[this.idKey]
        if(!this.checkedIds[itId])
          return false;  
      }
      return true
    },
    //--------------------------------------
    hasChecked() {
      for(let it of this.list){
        let itId = it[this.idKey]
        if(this.checkedIds[itId])
          return true  
      }
      return false
    },
    //--------------------------------------
    headCheckerIcon() {
      if(this.isAllChecked) {
        return "fas-check-square"
      }
      if(this.hasChecked) {
        return "fas-minus-square"
      }
      return "far-square"
    },
    //--------------------------------------
    selectedItems() {
      let idKey = this.idKey || "id"
      let list = []
      for(let it of this.list) {
        let itId = it[idKey]
        if(this.checkedIds[itId]) {
          list.push(it)
        }
      }
      return list
    },
    //--------------------------------------
    currentItem() {
      let idKey = this.idKey || "id"
      for(let it of this.list) {
        let itId = it[idKey]
        if(this.currentId == itId) {
          return it
        }
      }
    }
  },
  ///////////////////////////////////////////////////
  methods : {
    //--------------------------------------
    getIds({
      list=[],
      ids={}, 
      fromIndex=0, 
      toIndex=0, 
      currentId, 
      mode="actived"
    }={}) {
      let idKey = this.idKey || "id"
      // Shift mode may mutate multiple items in scope
      if('shift' == mode) {
        let min = Math.min(fromIndex, toIndex)
        let max = Math.max(fromIndex, toIndex)
        for(let i=0; i<list.length; i++) {
          let it = list[i]
          if(i>=min && i<=max) {
            ids[it[idKey]] = true
          }
        }
        return {...ids}
      }
      // Toggle mode need to mutate single one item
      if('toggle' == mode){
        let it = list[toIndex];
        let itId = it[idKey]
        ids[itId] = !ids[itId]
        return {...ids}
      }
      // Active mode need to keep only one item selected
      if('active' == mode) {
        return {[currentId] : true}
      }
      // invalid mode
      throw Ti.Err.make("e-com-TiTable-getIds-invalidMode", mode)
    },
    //--------------------------------------
    onSelected(it, index, eo){
      if(!this.selectable){
        return
      }
      // Eval Mode
      let mode = "active"
      if(this.multi) {
        if(eo.shiftKey) {
          mode = "shift"
        }
        // ctrl key on: toggle
        else if(eo.ctrlKey || eo.metaKey) {
          mode = "toggle"
        }
      }

      // Already current, ignore
      if("active" == mode && this.currentId == it.id) {
        return
      }

      // Eval current ID
      let id = it[this.idKey]

      // Get Check Ids
      this.checkedIds = this.getIds({
        list      : this.list,
        ids       : this.checkedIds,
        fromIndex : this.lastIndex,
        toIndex   : index,
        currentId : id,
        mode
      })

      // memo last Index
      if(!this.currentId || "active" == mode) {
        this.currentId = this.checkedIds[id] ? id : null
      }
      this.lastIndex = index

      // Do emit
      this.$emit("selected", {
        selected : this.selectedItems,
        current  : this.currentItem
      })
    },
    //--------------------------------------
    onToggle(it) {
      console.log("onToggle")
      let id = it[this.idKey]
      // Cancel it
      if(this.checkedIds[id]) {
        this.checkedIds = {
          ...this.checkedIds,
          [id] : false
        }
      }
      // multi
      else if(this.multi) {
        this.checkedIds = {
          ...this.checkedIds,
          [id] : true
        }
      }
      // Signle
      else {
        this.checkedIds = {[id] : true}
      }

      // memo current Id
      if(!this.currentId) {
        this.currentId = id
      }
      if(this.currentId 
        && !this.checkedIds[this.currentId]) {
        this.currentId = null
      }

      // Do emit
      this.$emit("selected", {
        selected : this.selectedItems,
        current  : this.currentItem
      })
    },
    //--------------------------------------
    onClickHeadRowChecker() {
      // All  -> none
      if(this.isAllChecked) {
        this.checkedIds = {}
      }
      // Half -> All
      // None -> All
      else {
        this.checkedIds = {}
        for(let it of this.list) {
          let itId = it[this.idKey]
          this.checkedIds[itId] = true
        }
      }

      // memo last Index
      if(!this.checkedIds[this.currentId]) {
        this.currentId = null
      }
      this.lastIndex = 0

      // Do emit
      this.$emit("selected", {
        selected : this.selectedItems,
        current  : this.currentItem
      })
    },
    //--------------------------------------
    onOpen(it,index) {
      this.$emit("open", {
        index,
        current :it
      })
    },
    //--------------------------------------
    onBlur() {
      if(!this.blurable)
        return
      this.checkedIds = {}
      this.currentId = null
      this.lastIndex = 0
      this.$emit("selected", {
        selected : [],
        current  : null
      })
    },
    //--------------------------------------
    bodyRowClass(it) {
      let itId = it[this.idKey]
      return {
        "is-selected" : this.checkedIds[itId],
        "is-current"  : this.currentId == itId,
        "is-changed"  : this.changedId == itId
      }
    },
    //--------------------------------------
    bodyRowCheckerIcon(it) {
      let itId = it[this.idKey]
      if(this.checkedIds[itId])
        return "fas-check-square"
      return "far-square"
    },
    //--------------------------------------
    cellStyle(index, fld={}) {
      // If should checkbox, the index should base on 1
      if(this.checkable)
        index++
      
      // Check boundary
      if(index >= this.formedColSizes.length)
        return

      // Eval the colWidth
      let col = this.formedColSizes[index]
      let width = col.fixed
                  ? col.size
                  : col.percent * this.tableDynamicWidth
      return Ti.Css.toStyle({width})
    },
    //--------------------------------------
    updateSizing() {
      this.viewportWidth = this.$el.getBoundingClientRect().width
      if(_.isEmpty(this.colSizes)) {
        // List two list of size 
        let lstHead = __find_each_col_size(this.$refs.head)
        let lstBody = __find_each_col_size(this.$refs.body)
        // Compare the max size to get the org-width of each columns
        let colSizes = []
        for(let i=0; i<lstHead.length; i++) {
          let liH = lstHead[i]
          let liB = lstBody[i]
          colSizes.push({
            fixed : liH.fixed || liB.fixed,
            size  : Math.max(liH.size, liB.size)
          })
        }
        this.colSizes = colSizes
        //console.log("!!!this.colSizes", this.colSizes)
      }
    }
  },
  ///////////////////////////////////////////////////
  mounted : function() {
    const debounceUpdateSizing = _.debounce(()=>{
      // Reset
      this.colSizes = []

      __clean_each_col_size(this.$refs.head)
      __clean_each_col_size(this.$refs.body)

      // re-count
      if(!_.isEmpty(this.fields) && !_.isEmpty(this.list)) {
        this.$nextTick(()=>{
          this.updateSizing()
        })
      }
    }, 100, {
      leading : false
    })
    this.$watch("fields", debounceUpdateSizing)
    this.$watch("list"  , debounceUpdateSizing)

    const debounceUpdateSizing2 = _.debounce(()=>{
      this.updateSizing()
    }, 100, {
      leading : true
    })
    Ti.Viewport.watch(this, {resize : debounceUpdateSizing2})
  }
}