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
    "sizes" : {
      type : Array,
      default : ()=>[]
    },
    "hoverId" : {
      type : String,
      default : null
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getListItemClass({
        "is-hover"   : this.isHover
      }, `row-indent-${this.indent}`)
    },
    //-----------------------------------------------
    isHover() {
      return this.hoverId && this.rowId == this.hoverId
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
    getCellSize(index) {
      if(this.sizes.length > index) {
        return this.sizes[index]
      }
    },
    //-----------------------------------------------
    OnClickIcon($event) {
      this.$emit("icon", {
        rowId  : this.rowId,
        shift  : $event.shiftKey,
        toggle : ($event.ctrlKey || $event.metaKey)
      })
    },
    //-----------------------------------------------
    OnMouseEnter() {
      this.$emit("enter", {
        rowId  : this.rowId
      })
    },
    //-----------------------------------------------
    OnMouseLeave() {
      this.$emit("leave", {
        rowId  : this.rowId
      })
    }
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////
}