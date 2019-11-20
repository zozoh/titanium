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
    p_last_index  : 0,
    p_current_id  : null,
    p_checked_ids : {},
    tableData : []
  }),
  ///////////////////////////////////////////////////
  props : {
    "idKey" : {
      type : String,
      default : "id"
    },
    "className" : {
      type : String,
      default : null
    },
    /***
     * Defind each column of the table by `Array{Object}`
     * The element in Array should like:
     * 
     * ```js
     * {
     *   title : "i18n:xxx",
     *   display : "theName"
     * }
     * ```
     * The field `display` defined how to render the column.
     * You can declare the value in three modes below:
     *  - String : render by `ti-label`
     *  - Object : customized the display method
     *  - Array{String|Object} : multi rendering
     * 
     * It will be formatted to Array like:
     * ```js
     * [{
     *    key : "theName",
     *    uniqueKey : "theName",  // String form by `key`
     *    type : "String",    // @see Ti.Types
     *    transformer : "toStr",  // @see Ti.Types.getFuncByType()
     *    comType : "ti-label",
     *    comConf : {}
     * }]
     * ```
     * The `key` present the way how to pick the value from row data.
     * It can be `String` or `Array`:
     *  - `String` : as key path to get the value
     *  - `Array`  : as key set to pick a new object
     * 
     * **Note!!** If key is falsy, the field will be ignored
     */
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    // extend function set for `transformer` in each field `display`
    "extendFunctionSet" : {
      type : Object,
      default : ()=>({})
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
    // If changed, it will sync to "p_current_id" and auto set "p_last_index"
    "currentId" : {
      type : String,
      default : null
    },
    // If changed, it will sync to "__checked_ids"
    "checkedIds" : {
      type : Array,
      default : ()=>[]
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
      if(this.className) {
        klass.push(this.className)
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
        if(!this.p_checked_ids[itId])
          return false;  
      }
      return true
    },
    //--------------------------------------
    hasChecked() {
      for(let it of this.list){
        let itId = it[this.idKey]
        if(this.p_checked_ids[itId])
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
        if(this.p_checked_ids[itId]) {
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
        if(this.p_current_id == itId) {
          return it
        }
      }
    },
    //--------------------------------------
    fnSet() {
      return _.assign({}, Ti.Types, this.extendFunctionSet)
    },
    //--------------------------------------
    displayFields() {
      let fields = []
      for(let fld of this.fields) {
        let display = this.evalFieldDisplay(fld)
        fields.push({
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
    evalFieldDisplay(fld) {
      let list = [].concat(fld.display)
      let items = []
      for(let li of list) {
        let m = /^<([^:>]*):([^>]+)>$/.exec(li)
        // Icon
        if(m) {
          items.push({
            key   : m[1] || Symbol(li),
            value : m[2],
            comType : "ti-icon"
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
    async evalTableData() {
      let sheet = []
      for(let li of this.list) {
        let obj = {
          key : li[this.idKey],
          raw : li,
          cells : []
        }
        // Evel display for cell
        for(let x=0; x<this.displayFields.length; x++) {
          let fld = this.displayFields[x]
          let display = await this.evalTableCellDisplay(li, fld)
          obj.cells.push({
            display,
            index    : x,
            fld      : fld,
            title    : fld.title,
            nowrap   : fld.nowrap            
          })
        }
        // Join to sheet
        sheet.push(obj)
      } // ~ for(let li of this.list) 
      return sheet
    },
    //--------------------------------------
    async evalTableCellDisplay(rowData, fld) {
      let list = []
      // Get items value
      for(let it of fld.display) {
        let value = it.value;
        //.....................................
        // Array -> Obj
        if(_.isArray(it.key)) {
          value = _.pick(rowData, it.key)
        }
        // String ...
        else if(_.isString(it.key)){
          // Statci value
          if(/^'[^']+'$/.test(it.key)) {
            value = it.key.substring(1, it.key.length-1)
          }
          // Dynamic value
          else {
            value = Ti.Util.fallback(_.get(rowData, it.key), value)
          }
        }
        //.....................................
        if(it.dict) {
          if(!Ti.Util.isNil(value)) {
            value = await Wn.Dict.get(it.dict, value)
          }
        }
        //.....................................
        // Transform
        if(_.isFunction(it.transformer)) {
          //console.log("do trans")
          // Sometimes, we need transform nil also
          if(!Ti.Util.isNil(value) || it.transNil) {
            value = it.transformer(value)
          }
        }
        // Ignore the undefined/null
        if(Ti.Util.isNil(value)) {
          continue
        }
        //.....................................
        // Add value to comConf
        let it2 = {...it}
        let conf2 = {}
        let valueAssigned = false
        //.....................................
        _.forEach(it2.comConf || {}, (val, key)=>{
          // assign value
          if("=value" == key) {
            _.assign(conf2, value)
            valueAssigned = true
          }
          // set val
          else {
            conf2[key] = val
          }
        })
        //.....................................
        if(!valueAssigned) {
          conf2.value = value
        }
        //.....................................
        it2.comConf = conf2
        //.....................................
        // console.log(it.key, value)
        // Join to list
        list.push(it2)
        //.....................................
      } // ~ for(let it of this.display)
      // Done
      return list
    },
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
      if("active" == mode && this.p_current_id == it.id) {
        return
      }

      // Eval current ID
      let id = it[this.idKey]

      // Get Check Ids
      this.p_checked_ids = this.getIds({
        list      : this.list,
        ids       : this.p_checked_ids,
        fromIndex : this.p_last_index,
        toIndex   : index,
        currentId : id,
        mode
      })

      // memo last Index
      if(!this.p_current_id || "active" == mode) {
        this.p_current_id = this.p_checked_ids[id] ? id : null
      }
      this.p_last_index = index

      // Do emit
      this.$emit("selected", {
        selected : this.selectedItems,
        current  : this.currentItem,
        currentId  : this.p_current_id,
        checkedIds : this.p_checked_ids
      })
    },
    //--------------------------------------
    onToggle(it) {
      // console.log("->onToggle:before", 
      //   JSON.stringify(this.p_checked_ids), this.p_current_id)
      let id = it[this.idKey]
      // Cancel it
      if(this.p_checked_ids[id]) {
        this.p_checked_ids = _.pickBy(this.p_checked_ids, (val, key)=>{
          return val && key != id
        })
      }
      // multi
      else if(this.multi) {
        this.p_checked_ids = {
          ...this.p_checked_ids,
          [id] : true
        }
      }
      // Signle
      else {
        this.p_checked_ids = {[id] : true}
      }

      // memo current Id
      if(!this.p_current_id) {
        this.p_current_id = id
      }
      if(this.p_current_id 
        && !this.p_checked_ids[this.p_current_id]) {
        this.p_current_id = null
      }

      // console.log("->onToggle:emit", 
      //   JSON.stringify(this.p_checked_ids), this.p_current_id)

      // Do emit
      this.$emit("selected", {
        selected : this.selectedItems,
        current  : this.currentItem,
        currentId  : this.p_current_id,
        checkedIds : this.p_checked_ids
      })

      // console.log("->onToggle:done", 
      //   JSON.stringify(this.p_checked_ids), this.p_current_id)
    },
    //--------------------------------------
    onClickHeadRowChecker() {
      // All  -> none
      if(this.isAllChecked) {
        this.p_checked_ids = {}
      }
      // Half -> All
      // None -> All
      else {
        this.p_checked_ids = {}
        for(let it of this.list) {
          let itId = it[this.idKey]
          this.p_checked_ids[itId] = true
        }
      }

      // memo last Index
      if(!this.p_checked_ids[this.p_current_id]) {
        this.p_current_id = null
      }
      this.p_last_index = 0

      // Do emit
      this.$emit("selected", {
        selected : this.selectedItems,
        current  : this.currentItem,
        currentId  : this.p_current_id,
        checkedIds : this.p_checked_ids
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
      this.p_checked_ids = {}
      this.p_current_id = null
      this.p_last_index = 0
      this.$emit("selected", {
        selected : [],
        current  : null
      })
    },
    //--------------------------------------
    bodyRowClass(it) {
      // console.log("->bodyRowClass", 
      //   JSON.stringify(this.p_checked_ids), this.p_current_id)
      let itId = it[this.idKey]
      return {
        "is-selected" : this.p_checked_ids && this.p_checked_ids[itId],
        "is-current"  : this.p_current_id && this.p_current_id == itId,
        "is-changed"  : this.changedId && this.changedId == itId
      }
    },
    //--------------------------------------
    bodyRowCheckerIcon(it) {
      // console.log("->bodyRowCheckerIcon", 
      //   JSON.stringify(this.p_checked_ids), this.p_current_id)
      let itId = it[this.idKey]
      if(this.p_checked_ids[itId])
        return "fas-check-square"
      return "far-square"
    },
    //--------------------------------------
    cellStyle(index) {
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
          let liH = lstHead[i] || {size:0}
          let liB = lstBody[i] || {size:0}
          colSizes.push({
            fixed : liH.fixed || liB.fixed,
            size  : Math.max(liH.size, liB.size)
          })
        }
        this.colSizes = colSizes
        //console.log("!!!this.colSizes", this.colSizes)
      }
    },
    //--------------------------------------
    autoSetCurrentId() {
      this.p_current_id = this.currentId
      this.p_last_index = 0
      for(let i=0; i<this.list.length; i++) {
        let it = this.list[i]
        let itId = it[this.idKey]
        if(itId == this.p_current_id) {
          this.p_last_index = i
          break;
        }
      }
    },
    //--------------------------------------
    autoSetCheckedIds() {
      this.p_checked_ids = {}
      if(_.isArray(this.checkedIds)) {
        for(let id of this.checkedIds) {
          this.p_checked_ids[id] = true
        }
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "currentId" : function() {
      this.autoSetCurrentId()
    },
    "checkedIds" : function() {
      this.autoSetCheckedIds()
    },
    "list" : async function() {
      this.tableData = await this.evalTableData()
      this.debounceUpdateSizing()
    },
    "fields" : function() {
      this.debounceUpdateSizing()
    }
  },
  ///////////////////////////////////////////////////
  mounted : async function() {
    this.tableData = await this.evalTableData()
    //.................................
    this.autoSetCurrentId()
    this.autoSetCheckedIds()
    //.................................
    this.debounceUpdateSizing = _.debounce(()=>{
      // Reset
      this.colSizes = []

      __clean_each_col_size(this.$refs.head)
      __clean_each_col_size(this.$refs.body)

      // re-count
      if(!_.isEmpty(this.fields)) {
        this.$nextTick(()=>{
          this.updateSizing()
        })
      }
    }, 100, {
      leading : false
    })
    //.................................
    // Update Sizing Right Now
    this.$nextTick(()=>{
      this.updateSizing()
    })
    //.................................
    const debounceQuickUpdateSizing = _.debounce(()=>{
      this.updateSizing()
    }, 100, {
      leading : true
    })
    //.................................
    Ti.Viewport.watch(this, {resize : debounceQuickUpdateSizing})
    //.................................
  },
  ///////////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////////////////////
}