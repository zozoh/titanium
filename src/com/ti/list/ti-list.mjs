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
    // Make the value as item tip if tip without defined
    "valueAsTip" : {
      type : Boolean,
      default : false
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
    // 0 - select current value item
    // otherwise, it will move offset from current value item
    // to mark the selected item
    // !! only work in single mode 
    "selectOffset" : {
      type : Number,
      default : 0
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
      let klass = []
      if(this.className) {
        klass.push(this.className)
      }
      if(this.dropOpened) {
        klass.push("is-drop-opened")
      }
      return klass
    },
    //--------------------------------------
    formedList() {
      let list = this.normalizeData(this.data, {
        multi   : this.multi,
        value   : this.value,
        mapping : this.mapping,
        emptyItem   : this.empty,
        defaultIcon : this.defaultIcon,
        focusIndex  : this.focusIndex,
        valueAsTip  : this.valueAsTip,
        offset: this.selectOffset
      })
      return list
    },
    //--------------------------------------
    hasIcon() {
      for(let it of this.formedList) {
        if(it.icon)
          return true
      }
      return false
    },
    //--------------------------------------
    hasData() {
      return !_.isEmpty(this.formedList)
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
          _.forEach(this.formedList, (it, i)=>{
            if(i>=minIndex && i<=maxIndex) {
              vals.push(it.value)
            }
          })
        }
        // Toggle mode
        else {
          _.forEach(this.formedList, (it, i)=>{
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
          let li = _.nth(this.formedList, index)
          this.$emit("toggle", li)
        }
        // Emit the value
        this.$emit("changed", vals)
      }
      // Single mode
      else {
        let it = this.formedList[index]
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