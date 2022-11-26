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
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      //console.error("row TopClass begin", this.index, this.rowId, this.tiComId)
      let re = this.getListItemClass({
        "is-fake"   : this.item.fake
      }, `row-indent-${this.indent}`)
      //console.log("row TopClass end", this.index, this.rowId, this.tiComId)
      return re
    },
    //-----------------------------------------------
    hasRealIcon() {
      return this.icon && _.isString(this.icon)
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