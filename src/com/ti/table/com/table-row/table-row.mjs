/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
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
    "changedId" : {
      type : String,
      default : null
    },
    "currentId" : {
      type : String,
      default : null
    },
    "checkedIds" : {
      type : Object,
      default : ()=>({})
    },
    "hoverId" : {
      type : String,
      default : null
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
    "openable" : {
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
    },
    "explainDict" : {
      type : Function,
      default : _.identity
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-self-actived" : this.isSelfActived,
        "is-actived" : this.isActived,
        "is-current" : this.isCurrent,
        "is-checked" : this.isChecked,
        "is-hover"   : this.isHover,
        "is-changed" : this.isChanged,
      }, this.className, `row-indent-${this.indent}`)
    },
    //-----------------------------------------------
    isCurrent() {
      return this.currentId && this.rowId == this.currentId
    },
    //-----------------------------------------------
    isChanged() {
      return this.changedId && this.rowId == this.changedId
    },
    //-----------------------------------------------
    isChecked() {
      return this.checkedIds[this.rowId] ? true : false
    },
    //-----------------------------------------------
    isHover() {
      return this.hoverId && this.rowId == this.hoverId
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
      let toggle = ($event.ctrlKey || $event.metaKey)
      if(this.selectable && (!this.isCurrent || toggle)) {
        this.$emit("select", {
          rowId  : this.rowId,
          shift  : $event.shiftKey,
          toggle
        })
      }
    },
    //-----------------------------------------------
    onDblClickRow() {
      if(this.openable) {
        this.$emit("open", {
          rowId  : this.rowId
        })
      }
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
    },
    //-----------------------------------------------
    doAutoActived() {
      if(!this.isActived && this.isCurrent) {
        this.__set_actived()
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "isCurrent" : function() {
      this.doAutoActived()
    }
  },
  ///////////////////////////////////////////////////
  mounted : function(){
    this.doAutoActived()
  }
  ///////////////////////////////////////////////////
}