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
    "icon" : {
      type : [Boolean, String],
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
      }, this.className, `row-indent-${this.indent}`)
    },
    //-----------------------------------------------
    hasRealIcon() {
      return this.icon && _.isString(this.icon)
    },
    //-----------------------------------------------
    theCheckIcon() {
      if(this.checkedIds[this.rowId]) {
        return this.checkIcons.on
      }
      return this.checkIcons.off
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
    onItemChanged({name,value}={}) {
      this.$emit("item:changed", {
        name, value,
        rowId : this.rowId,
        data  : this.data
      })
    },
    //-----------------------------------------------
    onClickIcon($event) {
      this.$emit("icon", {
        rowId  : this.rowId,
        shift  : $event.shiftKey,
        toggle : ($event.ctrlKey || $event.metaKey)
      })
    },
    //-----------------------------------------------
    onClickChecker($event) {
      if(this.checkable) {
        this.$emit("checker", {
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