export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    "treeTableData" : [],
    "openNodePaths" : {}
  }),
  //////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "nodeClassName" : {
      type : String,
      default : null
    },
    // The list to be rendered
    "data" : {
      type : Array,
      default : ()=>[]
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
    "display" : {
      type : [String, Object, Array],
      default : "name"
    },
    // Default to open the node in depth.
    // the top node depth is 1, which is eqausl the path array length.
    // If 0, it will close all top leavel nodes
    "defaultOpenDepth" : {
      type : Number,
      default : 1
    },
    // Local store to save the tree open status
    "keepOpenBy" : {
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
      type : [String, Number],
      default : null
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
    }
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
    hasData() {
      return !_.isEmpty(this.treeTableData)
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
      this.treeTableData = []

      if(!_.isEmpty(this.data)) {
        for(let item of this.data) {
          await this.joinTreeTableRow(this.treeTableData, item)
        }
      }
    },
    //--------------------------------------
    async joinTreeTableRow(rows=[], item={}, path=[]) {
      let itName = this.getNodeName(item)
      let itPath = _.concat(path, itName)
      let itPathId = itPath.join("/")
      let itId = Ti.Util.fallbackNil(this.getNodeId(item), itPathId)
      let itLeaf = this.isNodeLeaf(item)
      let opened = this.openNodePaths[itPathId] ? true : false;
      // Join Self
      let self = {
        id     : itId,
        name   : itName,
        icon   : itLeaf 
                  ? true
                  : this.nodeHandleIcons[opened ? 1 : 0],
        opened : opened,
        indent : path.length,
        path   : itPath,
        pathId : itPathId,
        leaf   : itLeaf,
        rawData : item 
      }
      rows.push(self)

      // Join Children
      if(self.opened && !self.leaf) {
        let children = await this.getNodeChildren(item)
        for(let child of children) {
          await this.joinTreeTableRow(rows, child, self.path)
        }
      }
    },
    //--------------------------------------
    findTableRow(rowId) {
      for(let row of this.treeTableData) {
        if(row.id == rowId) {
          return row
        }
      }
    },
    //--------------------------------------
    onRowSelected({currentId, checkedIds={}}={}) {
      let current, selected=[]
      // Has selected
      if(currentId) {
        for(let row of this.treeTableData) {
          if(row.id == currentId) {
            current = row.rawData
          }
          if(checkedIds[row.id]) {
            selected.push(row.rowData)
          }
        }
      }
      // Emit the value
      // console.log("selected", {
      //   current, selected,
      //   currentId, checkedIds
      // })
      this.$emit("selected", {
        current, selected,
        currentId, checkedIds
      })
    },
    //--------------------------------------
    onRowIconClick({rowId}={}) {
      console.log(rowId)
      let row = this.findTableRow(rowId)
      // Open it
      if(row && !row.leaf && !row.opened) {
        this.$set(this.openNodePaths, row.pathId, true)
      }
      // Close it
      else {
        this.$set(this.openNodePaths, row.pathId, false)
      }
      // Save to Local
      this.saveNodeOpenStatus()
    },
    //--------------------------------------
    saveNodeOpenStatus() {
      if(this.keepOpenBy) {
        Ti.Storage.session.setObject(this.keepOpenBy, this.openNodePaths)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "data" : async function() {
      await this.evalTreeTableData()
    }
  },
  //////////////////////////////////////////
  mounted : async function() {
    let vm = this
    // Ti.Dom.watchDocument("mouseup", this.__on_mouseup)
    // Recover the open status from local store
    if(this.keepOpenBy) {
      this.openNodePaths = Ti.Storage.session.getObject(this.keepOpenBy)
    }

    // Eval Data
    await this.evalTreeTableData()

    // Watch Deep
    this.$watch("openNodePaths", ()=>{
      this.evalTreeTableData()
    }, {deep:true})
    
  },
  //////////////////////////////////////////
  beforeDestroy : function(){
    //Ti.Dom.unwatchDocument("mouseup", this.__on_mouseup)
  }
  //////////////////////////////////////////
}