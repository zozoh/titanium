export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    "openNodeValues" : {},
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
    // How to mapping the list to formed value
    "mapping" : {
      type : Object,
      default : ()=>({})
    },
    "defaultIcon" : {
      type : String,
      default : null
    },
    // Href tmpl like "/xx/xx?id=${value}"
    "href" : {
      type : String,
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
      nd.selected = _.isEqual(nd.value, this.value)
      nd.opened = this.openNodeValues[nd.value] ? true : false
      nd.index = index
      nd.path = path
      _.defaults(nd, {
        className : this.nodeClassName,
        name : `N${index}`,
        icon : this.defaultIcon,
        tip  : node[this.defaultTipKey],
        href : this.href
      })
      // Children
      if(_.isArray(nd.children)) {
        nd.children = this.evalChildren(nd.children, _.concat(path, nd.name))
      }
      // Done
      return nd
    },
    //--------------------------------------
    onClick(it) {    
      this.$emit("selected", it)
      this.$emit("changed", it.value)
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