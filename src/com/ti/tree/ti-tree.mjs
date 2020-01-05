export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    "openNodePaths" : {},
    "selectedNodeValue" : null
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
    "nodeHandleIcons" : {
      type : Object,
      default : ()=>({
        "opened" : "zmdi-chevron-down",
        "closed" : "zmdi-chevron-right"
      })
    }
  },
  //////////////////////////////////////////
  watch : {
    "value" : function(val) {
      this.selectedNodeValue = val
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
    theTopData() {
      let list = this.evalChildren(this.data)
      return list
    },
    //--------------------------------------
    hasData() {
      return !_.isEmpty(this.theTopData)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    evalChildren(list=[], path=[]) {
      let children = []
      _.forEach(list, (li, index)=>{
        let nd = this.evalTreeNode(li, index, path)
        children.push(nd)
      })
      return children
    },
    //--------------------------------------
    /***
     * Each Tree Node 
     */
    evalTreeNode(node={}, index=0, path=[]) {
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
      nd.selected = !Ti.Util.isNil(nd.value) 
                    && _.isEqual(nd.value, this.value)
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
      nd.depth = nd.path.length
      // Mark leaf
      nd.leaf = !_.isArray(node.children)
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
        nd.children = this.evalChildren(nd.children, nd.path)
      }
      // Done
      return nd
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
        this.$emit("select", nd)
      }
    },
    //--------------------------------------
    onNodeOpen(nd={}) {
      //console.log("open")
      this.openNodePaths = _.assign({}, this.openNodePaths, {
        [nd.path.join("/")] : true
      })
      this.$emit("opened", nd)
    },
    //--------------------------------------
    onNodeClose(nd={}) {
      //console.log("close")
      this.openNodePaths = _.assign({}, this.openNodePaths, {
        [nd.path.join("/")] : false
      })
      this.$emit("closed", nd)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  mounted : function() {
    let vm = this
    // this.focusIndex = this.focus
    // this.__on_mouseup = function(index){
    //   vm.focusIndex = -1
    // }
    // Ti.Dom.watchDocument("mouseup", this.__on_mouseup)
    this.selectedNodeValue = this.value
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