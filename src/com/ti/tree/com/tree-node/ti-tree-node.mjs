export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  props : {
    "className" : null,
    "index" : {
      type : Number,
      default : 0
    },
    "name" : {
      type : String,
      default : null
    },
    "depth" : {
      type : Number,
      default : 1
    },
    "path" : {
      type : Array,
      default : ()=>[]
    },
    "text" : {
      type : String,
      default : null
    },
    "icon" : {
      type : [String, Object],
      default : null
    },
    "href" : {
      type : String,
      default : null
    },
    "value" : null,
    // The raw data of current node
    "raw" : null,
    // Display fields
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    // If table mode, each cell data
    "cells" : {
      type : Array,
      default : ()=>[]
    },
    "tip" : {
      type : String,
      default : null
    },
    "leaf" : {
      type : Boolean,
      default : false
    },
    "selected" : {
      type : Boolean,
      default : false
    },
    "opened" : {
      type : Boolean,
      default : false
    },
    "children" : {
      type : Array,
      default : null
    },
    "handleIcons" : {
      type : Object,
      default : ()=>({
        "opened" : "zmdi-chevron-down",
        "closed" : "zmdi-chevron-right"
      })
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-opened"   : this.opened,
        "is-selected" : this.selected,
        "at-top" : 1==this.depth,
        [`at-depth-${this.depth}`] : true
      }, this.className)
    },
    //--------------------------------------
    isLeaf() {
      return this.leaf
    },
    //--------------------------------------
    theIconList() {
      if(this.icon) {
        // Static Icon
        if(_.isString(this.icon)) {
          return [this.icon]
        }
        // Alt Icon Set
        if(_.isPlainObject(this.icon)) {
          if(this.icon.opened && this.icon.closed) {
            return this.opened
              ? [this.icon.opened]
              : [this.icon.closed]
          }
          return [this.icon]
        }
        // Array icon list
        if(_.isArray(this.icon)) {
          return this.icon
        }
      }
      return []
    },
    //--------------------------------------
    theHref() {
      if(this.href && !Ti.Util.isNil(this.value)) {
        return Ti.S.renderBy(this.href, this)
      }
    },
    //--------------------------------------
    theHandleIcon() {
      return this.opened
        ? this.handleIcons.opened
        : this.handleIcons.closed
    },
    //--------------------------------------
    isTable() {
      return _.isArray(this.fields) && !_.isEmpty(this.fields)
    },
    //--------------------------------------
    theNodeData() {
      return {
        className : this.className,
        index : this.index,
        name  : this.name,
        path  : this.path,
        text  : this.text,
        icon  : this.icon,
        href  : this.theHref,
        value : this.value,
        tip   : this.tip,
        selected : this.selected,
        opened   : this.opened,
        children : this.children
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    onClickSelf() {
      //console.log("click self")
      this.$emit("select", this.theNodeData)
    },
    //--------------------------------------
    onClickHandle() {
      //console.log("click handle")
      // Open -> Close
      if(this.opened) {
        this.$emit("close", this.theNodeData)
      }
      // Close -> Open
      else {
        this.$emit("open", this.theNodeData)
      }
    },
    //--------------------------------------
    onCellChanged(name, value) {
      this.$emit("node:changed", {name, value})
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}