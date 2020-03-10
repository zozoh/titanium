export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    "myTreeTableData"   : [],
    "myOpenedNodePaths" : {},
    "myCurrentId"       : null
  }),
  //////////////////////////////////////////
  props : {
    "nodeClassName" : {
      type : String,
      default : null
    },
    // The list to be rendered
    "data" : {
      type : [Object, Array],
      default : null
    },
    "idBy" : {
      type : [String, Function],
      default : "id"
    },
    "nameBy" : {
      type : [String, Function],
      default : "name"
    },
    "childrenBy" : {
      type : [String, Function],
      default : "children"
    },
    "leafBy" : {
      type    : [String, Function],
      default : "!children"
    },
    "title" : {
      type : String,
      default : 'i18n:title'
    },
    "mainWidth" : {
      type : [String, Number],
      default : 'stretch'
    },
    "display" : {
      type : [String, Object, Array],
      default : "name"
    },
    // Default to open the node in depth.
    // the top node depth is 1, which is eqausl the path array length.
    // If 0, it will close all top leavel nodes
    "defaultOpenDepth" : {
      type : Number,
      default : 0
    },
    // Local store to save the tree open status
    "keepOpenBy" : {
      type : String,
      default : null
    },
    "keepCurrentBy" : {
      type : String,
      default : null
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
    "openedNodePaths" : {
      type : Object,
      default : ()=>({})
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
      default : false
    },
    "width" : {
      type : [String, Number],
      default : null
    },
    "puppetMode" : {
      type : Boolean,
      default : false
    },
    "height" : {
      type : [String, Number],
      default : null
    },
    "autoScrollIntoView" : {
      type : Boolean,
      default : true
    },
    "autoOpen" : {
      type : Boolean,
      default : false
    },
    "showRoot" : {
      type : Boolean,
      default : true
    },
    "nodeHandleIcons" : {
      type : Array,
      default : ()=>[
        "zmdi-chevron-right",
        "zmdi-chevron-down"]
    },
    "border" : {
      type : String,
      default : "column",
      validator : v => /^(row|column|cell|none)$/.test(v)
    },
    "extendFunctionSet" : {
      type : Object,
      default : ()=>({})
    },
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    "blankAs" : undefined
  },
  //////////////////////////////////////////
  watch : {
    
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-selectable"  : this.selectable,
        "is-hoverable"   : this.hoverable
      }, this.className)
    },
    //--------------------------------------
    topStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //--------------------------------------
    theDefaultNodeIcon() {
      if(this.defaultIcon) {
        let icons = this.defaultIcon
        if(_.isPlainObject(icons)) {
          if(icons.node && icons.leaf) {
            return icons.node
          }
        }
        return icons
      }
    },
    //--------------------------------------
    theDefaultLeafIcon() {
      if(this.defaultIcon) {
        let icons = this.defaultIcon
        if(_.isPlainObject(icons)) {
          if(icons.node && icons.leaf) {
            return icons.leaf
          }
        }
        return icons
      }
    },
    //--------------------------------------
    getNodeId() {
      if(_.isFunction(this.idBy)) {
        return (it)=>this.idBy(it)
      }
      return (it)=>_.get(it, this.idBy)
    },
    //--------------------------------------
    getNodeName() {
      if(_.isFunction(this.nameBy)) {
        return it => this.nameBy(it)
      }
      return it => _.get(it, this.nameBy)
    },
    //--------------------------------------
    isNodeLeaf() {
      if(_.isFunction(this.leafBy)) {
        return it => (this.leafBy(it) ? true : false)
      }
      // Not
      let m = /^(!)?(.+)$/.exec(this.leafBy)
      let isNot = m[1] ? true : false
      let keyPath = _.trim(m[2])
      return it => (_.get(it, keyPath) ? !isNot : isNot)
    },
    //--------------------------------------
    getNodeChildren() {
      if(_.isFunction(this.childrenBy)) {
        return it => this.childrenBy(it)
      }
      return it => _.get(it, this.childrenBy)
    },
    //--------------------------------------
    isTable() {
      return _.isArray(this.fields) && !_.isEmpty(this.fields)
    },
    //--------------------------------------
    theTableHead() {
      if(this.isTable) {
        return "frozen"
      }
      return "none"
    },
    //--------------------------------------
    theTableFields() {
      let mainCol = {
        title   : this.title,
        width   : this.mainWidth,
        nowrap  : true,
        display : this.display
      }
      if(this.isTable) {
        return _.concat(mainCol, this.fields)
      }
      return [mainCol]
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    async evalTreeTableData() {
      // if(_.get(this.data, "value.title"))
      //     console.log("evalTreeTableData", _.get(this.data, "value.title"))
      let tableData = []

      //if(this.showRoot)
      //console.log("evalTreeTableData", this.data)

      // Array push to root
      if(_.isArray(this.data)) {
        await this.joinTreeTableRow(tableData, {
          children : this.data
        }, null)
      }
      // already has root
      else {
        await this.joinTreeTableRow(tableData, this.data, null)
      }

      this.myTreeTableData = tableData
    },
    //--------------------------------------
    async joinTreeTableRow(rows=[], item={}, path=[]) {
      // if(this.showRoot)
      //   console.log("joinTreeTableRow", item)
      let self = {}
      //....................................
      // For ROOT
      if(!path) {
        self.name = this.getNodeName(item) || "$ROOT$"
        self.path = []
        self.pathId = "/"
        self.id = Ti.Util.fallbackNil(this.getNodeId(item), self.pathId)
        self.indent = 0
        self.leaf   = this.isNodeLeaf(item)
        self.opened = !this.showRoot
          ? true 
          : Ti.Util.fallback(
              this.myOpenedNodePaths[self.pathId], 
              self.indent < this.defaultOpenDepth);
        self.icon   = self.leaf ? true : this.nodeHandleIcons[self.opened ? 1 : 0]
      }
      // Others node
      else {
        self.name   = this.getNodeName(item)
        self.path   = _.concat(path, self.name)
        self.pathId = self.path.join("/")
        self.id = Ti.Util.fallbackNil(this.getNodeId(item), self.pathId)
        self.indent = self.path.length
        self.leaf   = this.isNodeLeaf(item)
        self.opened = Ti.Util.fallback(
          this.myOpenedNodePaths[self.pathId], 
          self.indent < this.defaultOpenDepth);
        self.icon   = self.leaf ? true : this.nodeHandleIcons[self.opened ? 1 : 0]
      }
      //....................................
      // Join the rawData
      self.rawData = item
      //....................................
      // Add root if necesssary
      if(this.showRoot) {
        rows.push(self)
      }
      // If not show root, minus depth
      else {
        self.indent --
        if(self.indent >= 0) {
          rows.push(self)
        }
      }
      //....................................
      // Join Children
      if(self.opened && !self.leaf) {
        let children = await this.getNodeChildren(item)
        for(let child of children) {
          await this.joinTreeTableRow(rows, child, self.path)
        }
      }
      //....................................
    },
    //--------------------------------------
    findTableRow(rowId) {
      if(!Ti.Util.isNil(rowId)) {
        for(let row of this.myTreeTableData) {
          if(row.id == rowId) {
            return row
          }
        }
      }
    },
    //--------------------------------------
    onItemChanged({name, value, rowId}={}) {
      let row = this.findTableRow(rowId)
      if(row) {
        this.$emit("item:change", {
          name,
          value,
          node   : row,
          nodeId : rowId,
          data   : row.rawData
        })
      }
    },
    //--------------------------------------
    onRowSelected({currentId, checkedIds={}}={}) {
      let current, selected=[]
      // Has selected
      if(currentId) {
        let currentRow;
        for(let row of this.myTreeTableData) {
          if(row.id == currentId) {
            currentRow = row
            current = row.rawData
          }
          if(checkedIds[row.id]) {
            selected.push(row.rawData)
          }
        }
        // Auto Open
        if(currentRow && this.autoOpen) {
          this.openRow(currentRow)
        }
        // Store current Id
        this.myCurrentId = _.get(currentRow, "id")
      }
      // Cancel current row
      else {
        this.myCurrentId = null
      }
      // Save local status
      if(this.keepCurrentBy) {
        if(!this.puppetMode) {
          Ti.Storage.session.set(this.keepCurrentBy, this.myCurrentId)
        }
      }
      // Emit the value
      this.$emit("select", {
        current, selected,
        currentId, checkedIds
      })
    },
    //--------------------------------------
    onRowIconClick({rowId}={}) {
      let row = this.findTableRow(rowId)
      // Open it
      if(row && !row.leaf && !row.opened) {
        this.openRow(row)
      }
      // Close it
      else {
        this.closeRow(row)
      }
    },
    //--------------------------------------
    openRow(rowOrId) {
      let row = _.isString(rowOrId) 
                  ? this.findTableRow(rowOrId)
                  : rowOrId
      if(row && !row.leaf && !row.opened) {
        this.$set(this.myOpenedNodePaths, row.pathId, true)
        // Notify status changed
        this.$emit("opened", row)
        // Save to Local
        this.saveNodeOpenStatus()
      }
    },
    //--------------------------------------
    closeRow(rowOrId) {
      let row = _.isString(rowOrId) 
                  ? this.findTableRow(rowOrId)
                  : rowOrId
      if(row && !row.leaf && row.opened) {
        this.$set(this.myOpenedNodePaths, row.pathId, false)
        // Notify status changed
        this.$emit("closed", row)
        // Save to Local
        this.saveNodeOpenStatus()
      }
    },
    //--------------------------------------
    saveNodeOpenStatus() {
      if(this.keepOpenBy) {
        Ti.Storage.session.setObject(this.keepOpenBy, this.myOpenedNodePaths)
      }
      this.$emit("opened-status:changed", this.myOpenedNodePaths)
    },
    //--------------------------------------
    syncOpenedNodePaths() {
      this.myOpenedNodePaths = _.assign({}, this.openedNodePaths)
    },
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      if("ARROWLEFT" == uniqKey) {
        this.closeRow(this.myCurrentId)
      }

      if("ARROWRIGHT" == uniqKey) {
        this.openRow(this.myCurrentId)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "data" : async function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        await this.evalTreeTableData()
      }
    },
    "openedNodePaths" : function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        //console.log("tree openedNodePaths changed")
        this.syncOpenedNodePaths()
      }
    }
  },
  //////////////////////////////////////////
  mounted : async function() {
    //.................................
    this.syncOpenedNodePaths()
    //.................................
    // Ti.Dom.watchDocument("mouseup", this.__on_mouseup)
    // Recover the open status from local store
    if(this.keepOpenBy) {
      this.myOpenedNodePaths = Ti.Storage.session.getObject(this.keepOpenBy)
      if(!this.puppetMode) {
        this.$emit("opened-status:changed", this.myOpenedNodePaths)
      }
    }
    //................................
    // Eval Data
    await this.evalTreeTableData()
    //................................
    // Watch Deep
    this.$watch("myOpenedNodePaths", ()=>{
      this.evalTreeTableData()
    }, {deep:true})
    //................................
    // Recover the current
    if(this.keepCurrentBy) {
      let currentId = Ti.Storage.session.get(this.keepCurrentBy)
      if(!Ti.Util.isNil(currentId)) {
        this.$nextTick(()=>{
          this.$children[0].selectRow(currentId)
        })
      }
    }
    //................................
  },
  //////////////////////////////////////////
  beforeDestroy : function(){
    //Ti.Dom.unwatchDocument("mouseup", this.__on_mouseup)
  }
  //////////////////////////////////////////
}