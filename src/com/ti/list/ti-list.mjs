export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    lastIndex  : 0,
    focusIndex : -1
  }),
  //////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "empty" :{
      type : Object,
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
    "focus" : {
      type : Number,
      default : -1
    },
    // multi-selectable
    // effected when selectable is true
    "multi" : {
      type : Boolean,
      default : false
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
    }
  },
  //////////////////////////////////////////
  watch : {
    "focus" : function(val) {
      this.focusIndex = val
    },
    "value" : function(val) {
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
    theData() {
      let list = this.normalizeData(this.data, {
        multi   : this.multi,
        value   : this.value,
        mapping : this.mapping,
        emptyItem   : this.empty,
        defaultIcon : this.defaultIcon,
        focusIndex  : this.focusIndex,
        defaultTipKey : this.defaultTipKey
      })
      return list
    },
    //--------------------------------------
    hasIcon() {
      for(let it of this.theData) {
        if(it.icon)
          return true
      }
      return false
    },
    //--------------------------------------
    hasData() {
      return !_.isEmpty(this.theData)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    itemClass(it) {
      return {
        "is-selected" : it.selected,
        "is-focused"  : it.focused
      }
    },
    //--------------------------------------
    onClick(index, eo) {
      // Multi mode
      if(this.multi) {
        let vals = []
        // Shift mode
        if(eo.shiftKey) {
          let minIndex = Math.min(index, this.lastIndex)
          let maxIndex = Math.max(index, this.lastIndex)
          _.forEach(this.theData, (it, i)=>{
            if(i>=minIndex && i<=maxIndex) {
              vals.push(it.value)
            }
          })
        }
        // Toggle mode
        else {
          _.forEach(this.theData, (it, i)=>{
            // The item which to be click, toggle
            if(index == i) {
              if(!it.selected) {
                vals.push(it.value)
              }
            }
            // Others
            else if(it.selected) {
              vals.push(it.value)
            }
          })
          // Notify the list-item
          let li = _.nth(this.theData, index)
          this.$emit("toggle", li)
        }
        // Emit the value
        this.$emit("changed", vals)
      }
      // Single mode
      else {
        let it = this.theData[index]
        this.$emit("selected", it)
        this.$emit("changed", it.value)
      }
      // remember the last
      this.lastIndex = index
    },
    //--------------------------------------
    onMouseDown(index, eo) {
      this.focusIndex = index
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
  updated : function(){
    this.lastIndex = 0
  },
  //////////////////////////////////////////
  mounted : function() {
    let vm = this
    this.focusIndex = this.focus
    this.__on_mouseup = function(index){
      vm.focusIndex = -1
    }
    Ti.Dom.watchDocument("mouseup", this.__on_mouseup)
    if(this.autoScrollIntoView) {
      this.scrollFirstSelectedIntoView()
    }
  },
  //////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Dom.unwatchDocument("mouseup", this.__on_mouseup)
  }
  //////////////////////////////////////////
}