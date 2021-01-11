/////////////////////////////////////////////////////
export default {
  ///////////////////////////////////////////////////
  props : {
    "indent" : {
      type : Number,
      default : 0
    },
    "icon" : {
      type : [Boolean, String],
      default : null
    },
    "fields" : {
      type : Array,
      default : ()=>[]
    },
    "rowNumberBase" : {
      type : Number,
      default : undefined
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getListItemClass({
        "is-fake"   : this.item.fake
      }, `row-indent-${this.indent}`)
    },
    //-----------------------------------------------
    hasRealIcon() {
      return this.icon && _.isString(this.icon)
    },
    //-----------------------------------------------
    hasRowNumber() {
      return _.isNumber(this.rowNumberBase)
    },
    //-----------------------------------------------
    RowNumber() {
      if(this.hasRowNumber) {
        return this.rowNumberBase + this.index
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    OnClickIcon($event) {
      this.$notify("icon", {
        rowId  : this.rowId,
        shift  : $event.shiftKey,
        toggle : ($event.ctrlKey || $event.metaKey)
      })
    }
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////
}