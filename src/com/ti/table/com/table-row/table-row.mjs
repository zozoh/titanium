/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    "className" : null,
    "rowId" : {
      type : String,
      default : null
    },
    // i18n string to present the field display text
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    // Auto wrap table, true:nowrap, false:wrap
    "data" : {
      type : Object,
      default : false
    },
    "sizes" : {
      type : Array,
      default : ()=>[]
    },
    "currentId" : {
      type : String,
      default : null
    },
    "checkedIds" : {
      type : Object,
      default : ()=>({})
    },
    "indent" : {
      type : Number,
      default : 0
    },
    "checkable" : {
      type : Boolean,
      default : false
    },
    "selectable" : {
      type : Boolean,
      default : true
    },
    "checkIcons" : {
      type : Object,
      default : ()=>({
        on  : "fas-check-square",
        off : "far-square"
      })
    },
    // Design for tree-table handler icon
    "statusIcon" : {
      type : String,
      default : null
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-current" : (this.rowId == this.currentId),
        "is-checked" : (this.checkedIds[this.rowId] ? true : false)
      }, this.className)
    },
    //-----------------------------------------------
    theCheckIcon() {
      if(this.checkedIds[this.rowId]) {
        return this.checkIcons.on
      }
      return this.checkIcons.off
    },
    //-----------------------------------------------
    theRowHeadStyle() {
      if(this.sizes.length > 0) {
        return Ti.Css.toStyle({
          "width" : this.sizes[0]
        })
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    getCellSize(index) {
      if(this.sizes.length > index) {
        return this.sizes[index]
      }
    },
    //-----------------------------------------------
    onClickChecker($event) {
      if(this.checkable) {
        this.$emit("toggle", {
          rowId  : this.rowId,
          shift  : $event.shiftKey,
          toggle : ($event.ctrlKey || $event.metaKey)
        })
      }
    },
    //-----------------------------------------------
    onClickRow($event) {
      if(this.selectable) {
        this.$emit("select", {
          rowId  : this.rowId,
          shift  : $event.shiftKey,
          toggle : ($event.ctrlKey || $event.metaKey)
        })
      }
    }
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////

  ///////////////////////////////////////////////////
}