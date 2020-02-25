/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
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
    topClass() {
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
    onMouseEnter() {
      this.$emit("enter", {
        rowId  : this.rowId
      })
    },
    //-----------------------------------------------
    onMouseLeave() {
      this.$emit("leave", {
        rowId  : this.rowId
      })
    }
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////
}