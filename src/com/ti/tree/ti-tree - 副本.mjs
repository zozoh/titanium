export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    "theTopData" : [],
    "openNodePaths" : {},
    "selectedNodePath" : null
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
    "value" : null,
    // If `tip` without defined, use this key
    // The key should be considering as it in prop data element
    // As we said, the `orginal data key`
    "defaultTipKey" : {
      type : String,
      default : null
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
    // How to mapping the list to formed value
    "mapping" : {
      type : Object,
      default : ()=>({})
    },
    "defaultIcon" : {
      type : [String, Object],
      default : null
    },
    // Href tmpl like "/xx/xx?id=${value}"
    "href" : {
      type : String,
      default : null
    },
    "width" : {
      type : [String, Number],
      default : null
    },
    "height" : {
      type : [String, Number],
      default : null
    },
    // select item
    "selectable" : {
      type : Boolean,
      default : true
    },
    // show hover
    "hoverable" : {
      type : Boolean,
      default : true
    },
    // rename items, it will pass on to slot.default
    "renameable" : {
      type : Boolean,
      default : false
    },
    // auto scroll the first highlight items into view
    "autoScrollIntoView" : {
      type : Boolean,
      default : true
    },
    // If true, when focus one node, it will auto-open the sub-tree
    "autoOpen" : {
      type : Boolean,
      default : false
    },
    "nodeHandleIcons" : {
      type : Object,
      default : ()=>({
        "opened" : "zmdi-chevron-down",
        "closed" : "zmdi-chevron-right"
      })
    },
    // Same as table
    "fields" : {
      type : Array,
      default : ()=>[]
    }
  },
  //////////////////////////////////////////
  watch : {
    "value" : function(val) {
      this.selectedNodePath = val
      if(!_.isNull(val)) {
        if(this.autoScrollIntoView) {
          this.$nextTick(()=>{
            this.scrollFirstSelectedIntoView()
          })
        }
      }
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-selectable"  : this.selectable,
        "is-hoverable"   : this.hoverable,
        "is-drop-opened" : this.dropOpened
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
    hasData() {
      return !_.isEmpty(this.theTopData)
    },
    //--------------------------------------
    isTable() {
      return _.isArray(this.fields) && !_.isEmpty(this.fields)
    },
    //--------------------------------------
    theFields() {
      let fields = []
      for(let fld of this.fields) {
        let display = this.evalFieldDisplay(fld)
        fields.push({
          key    : fld.key,
          title  : fld.title,
          nowrap : fld.nowrap,
          display
        })
      }
      return fields
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    async evalChildren(list=[], path=[]) {
      let children = []
      for(let index=0; index<list.length; index++) {
        let li = list[index]
        let nd = await this.evalTreeNode(li, index, path)
        let it = {}
        if(this.isTable) {
          it = await this.evalListItem(this.theFields, li)
        }
        children.push({
          ...nd, ...it
        })
      }
      return children
    },
    //--------------------------------------
    /***
     * Each Tree Node 
     */
    async evalTreeNode(node={}, index=0, path=[]) {
      let nd
      // Mapping
      if(_.isPlainObject(this.mapping)) {
        nd = Ti.Util.mapping(node, this.mapping)
      }
      // Just clone it
      else {
        nd = _.cloneDeep(node)
      }
      // Self
      nd.index = index
      _.defaults(nd, {
        className : this.nodeClassName,
        name : `N${index}`,
        text : nd.name,
        icon : nd.leaf 
                ? this.theDefaultLeafIcon
                : this.theDefaultNodeIcon,
        tip  : node[this.defaultTipKey],
        href : this.href
      })
      // Eval Path
      nd.path = _.concat(path, nd.name)
      nd.depth = nd.path.length - 1
      // Mark leaf
      nd.leaf = !_.isArray(node.children)
      // Test Selected
      nd.selected = _.isEqual(nd.path, this.selectedNodePath)
      // Test Open
      if(nd.leaf) {
        nd.opended = false
      }
      // Tree Node default to open
      else {
        nd.opened = Ti.Util.fallbackNil(
          this.openNodePaths[nd.path.join("/")],
          nd.opened,
          nd.depth <= this.defaultOpenDepth
        )
      }
      // Children
      if(_.isArray(nd.children)) {
        nd.children = await this.evalChildren(nd.children, nd.path)
      }
      // Done
      return nd
    },
    //--------------------------------------
    findNodeByValue(value, list=[]) {
      if(Ti.Util.isNil(value)) {
        return
      }
      for(let nd of list) {
        if(!Ti.Util.isNil(nd.value)
           && _.isEqual(nd.value, value)) {
          return nd
        }
        if(!nd.leaf && _.isArray(nd.children)) {
          let re = this.findNodeByValue(value, nd.children)
          if(!Ti.Util.isNil(re)) {
            return re
          }
        }
      }
    },
    //--------------------------------------
    findNodePathByValue(value, list=[]) {
      let node = this.findNodeByValue(value, list);
      if(node) {
        return node.path
      }
    },
    //--------------------------------------
    evalSelectedNodePath() {
      if(this.selectable) {
        this.$nextTick(()=>{
          this.selectedNodePath = this.findNodePathByValue(this.value, this.theTopData)
        })
      }
    },
    //--------------------------------------
    scrollFirstSelectedIntoView() {
      // find the first selected element
      let [$first] = Ti.Dom.findAll("li.is-selected", this.$el)
      if($first) {
        let rect = Ti.Rects.createBy($first)
        let view = Ti.Rects.createBy(this.$el)
        if(!view.contains(rect)) {
          this.$el.scrollTop += rect.top - view.top
        }
      }
    },
    //--------------------------------------
    onNodeSelect(nd={}) {
      //console.log("select", nd)
      // Without value, toggle open
      if(Ti.Util.isNil(nd.value)) {
        if(nd.opened) {
          this.onNodeClose(nd)
        } else {
          this.onNodeOpen(nd)
        }
      }
      // Select the Node
      else {
        // Mark selected
        if(this.selectable) {
          this.selectedNodePath = nd.path
        }
        // Emit message
        this.$emit("select", nd)
        // Auto Open Node
        if(!nd.leaf && this.autoOpen && !nd.opened) {
          this.onNodeOpen(nd)
        }
      }
    },
    //--------------------------------------
    onNodeOpen(nd={}) {
      //console.log("open")
      this.openNodePaths = _.assign({}, this.openNodePaths, {
        [nd.path.join("/")] : true
      })
      this.saveNodeOpenStatus()
      this.$emit("opened", nd)
    },
    //--------------------------------------
    onNodeClose(nd={}) {
      //console.log("close")
      this.openNodePaths = _.assign({}, this.openNodePaths, {
        [nd.path.join("/")] : false
      })
      this.saveNodeOpenStatus()
      this.$emit("closed", nd)
    },
    //--------------------------------------
    onNodeChanged(payload){
      console.log(payload)
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
    "value" : function(val) {
      this.evalSelectedNodePath()
    },
    "data" : async function() {
      this.evalSelectedNodePath()
      this.theTopData = await this.evalChildren(this.data)
    },
    "selectedNodePath" : async function() {
      this.theTopData = await this.evalChildren(this.data)
    },
    "openNodePaths" : async function() {
      this.theTopData = await this.evalChildren(this.data)
    }
  },
  //////////////////////////////////////////
  mounted : async function() {
    let vm = this
    // this.focusIndex = this.focus
    // this.__on_mouseup = function(index){
    //   vm.focusIndex = -1
    // }
    // Ti.Dom.watchDocument("mouseup", this.__on_mouseup)
    //console.log("tree mounted")
    this.theTopData = await this.evalChildren(this.data)

    this.evalSelectedNodePath()

    if(this.keepOpenBy) {
      this.openNodePaths = Ti.Storage.session.getObject(this.keepOpenBy)
    }
    if(this.autoScrollIntoView) {
      this.scrollFirstSelectedIntoView()
    }
  },
  //////////////////////////////////////////
  beforeDestroy : function(){
    //Ti.Dom.unwatchDocument("mouseup", this.__on_mouseup)
  }
  //////////////////////////////////////////
}