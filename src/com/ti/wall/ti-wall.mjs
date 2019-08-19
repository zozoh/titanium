/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    p_last_index  : 0,
    p_current_id  : null,
    p_checked_ids : {},
    col_count : 0,
    col_width : 0,
    only_one_row : true
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
    "itemClassName" : {
      type : String,
      default : null
    },
    // extend function set for `transformer` in each field `display`
    "extendFunctionSet" : {
      type : Object,
      default : ()=>({})
    },
    "transformer" : {
      type : [String,Object,Function],
      default : null
    },
    "comType" : {
      type : String,
      default : "ti-label"
    },
    "comConf" : {
      type : Object,
      default : ()=>({
        value : "=formedData"
      })
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
    // Wall-Tile width
    "itemWidth" : {
      type : [String, Number],
      default : null
    },
    // Wall-Tile height
    "itemHeight" : {
      type : [String, Number],
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
    // select item
    "selectable" : {
      type : Boolean,
      default : true
    },
    "border" : {
      type : Boolean,
      default : true
    },
    // aspect: list item spacing
    // `no|xs|sm|md|lg|xl`
    "spacing" : {
      type : String,
      default : "sm"
    },
    // Function return current item is hidden or not
    // the item is list[i]
    "isHiddenItem" : {
      type : Function,
      default : ()=>false
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    // theList() {
    //   if(this.list.length >0 && this.list[0].id == "30a87ogcf6j6jqfcf78r7mj4ha") {
    //     console.log("!!!!", JSON.stringify(this.list[0],null, '   '))
    //   }
    //   return this.list
    // },
    //--------------------------------------
    isEmpty() {
      return !this.list 
             || this.list.length == 0
    },
    //--------------------------------------
    listRealCount() {
      let n = 0;
      for(let it of this.list) {
        if(!this.isHidden(it)){
          n++
        }
      }
      return n
    },
    //--------------------------------------
    blankCols() {
      let list = []
      if(!_.isEmpty(this.list) 
        && this.col_count > 0 
        && this.col_width > 1
        && !this.only_one_row) {
        // get list real count
        let n = this.listRealCount % this.col_count
        if(n > 0) {
          let nr = this.col_count - n
          for(let i=0; i<nr; i++) {
            list.push({
              width : `${this.col_width}px`
            })
          }
        }
      }
      //console.log(list)
      return list
    },
    //--------------------------------------
    topClass() {
      let klass = [`spacing-${this.spacing}`]
      //......................
      if(this.border) {
        klass.push("show-border")
      }
      //......................
      if(this.className) {
        klass.push(this.className)
      }
      //......................
      if(this.only_one_row) {
        klass.push("is-only-one-row")
      } else {
        klass.push("is-multi-rows")
      }
      //......................
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
    }
    //--------------------------------------
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
    onTileSelected({id, index, $event}={}) {
      //console.log(id, index, $event)
      this.onSelected({it:id, index, $event, selectingOnly:true})
    },
    //--------------------------------------
    onSelected({it, index, $event, selectingOnly=false}={}){
      if(!this.selectable){
        return
      }
      // Eval Mode
      let mode = "active"
      if(this.multi) {
        if($event.shiftKey) {
          mode = "shift"
        }
        // ctrl key on: toggle
        else if($event.ctrlKey || $event.metaKey) {
          mode = "toggle"
        }
      }

      // Eval current ID
      let id = _.isString(it) ? it : it[this.idKey]

      // Already current, ignore
      if("active" == mode && this.p_current_id == id) {
        return
      }

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
        selectingOnly
      })
    },
    //--------------------------------------
    onToggle(it) {
      //console.log("TiWall::onToggle")
      let id = _.isString(it) ? it : it[this.idKey]
      // Cancel it
      if(this.p_checked_ids[id]) {
        this.p_checked_ids = {
          ...this.p_checked_ids,
          [id] : false
        }
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
      this.p_checked_ids = {}
      this.p_current_id = null
      this.p_last_index = 0
      this.$emit("selected", {
        selected : [],
        current  : null
      })
    },
    //--------------------------------------
    isHidden(it) {
      if(_.isFunction(this.isHiddenItem))
        return this.isHiddenItem(it)
      return false
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
    },
    //--------------------------------------
    updateSizing() {
      this.$nextTick(()=>{
        let $divs = Ti.Dom.findAll(":scope > .wall-tile", this.$el)
        // Guard empty
        if(_.isEmpty($divs)) 
          return
        // Eval the cols and width
        let cols  = 0
        let width = 1
        let top = -1
        let only_one_row = true
        for(let $div of $divs) {
          let rect = $div.getBoundingClientRect()
          if(top < 0) {
            top  = rect.top
          }
          if(top == rect.top) {
            cols ++
            width = Math.max(rect.width, width)
          }
          // Find the next row
          else {
            only_one_row = false
            break
          }
        }
        //console.log({cols, width, top})
        if(width > 1) {
          this.col_count = cols
          this.col_width = width
          this.only_one_row = only_one_row
        }
      })
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
    "list" : function() {
      this.updateSizing()
    }
  },
  ///////////////////////////////////////////////////
  mounted : function() {
    this.autoSetCurrentId()
    this.autoSetCheckedIds()
    //.................................
    this.updateSizing()
    //.................................
    const debounceUpdateSizing = _.debounce(()=>{
      this.updateSizing()
    }, 500, {
      leading : false
    })
    //.................................
    Ti.Viewport.watch(this, {resize : debounceUpdateSizing})
    //.................................
  },
  ///////////////////////////////////////////////////
  destroyed : function() {
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////////////////////
}