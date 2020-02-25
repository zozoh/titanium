export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    "index" : {
      type : Number,
      default : -1
    },
    "rowId" : {
      type : String,
      default : null
    },
    "data" : null,
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
    "explainDict" : {
      type : Function,
      default : _.identity
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    getListItemClass() {
      return (...klass)=>this.getTopClass({
        "is-current" : this.isCurrent,
        "is-checked" : this.isChecked,
        "is-changed" : this.isChanged
      }, klass)
    },
    //-----------------------------------------------
    isCurrent() {
      return this.rowId == this.currentId
    },
    //-----------------------------------------------
    isChanged() {
      return this.rowId == this.changedId
    },
    //-----------------------------------------------
    isChecked() {
      return this.checkedIds[this.rowId] ? true : false
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
    onDblClickRow($event) {
      if(this.openable) {
        $event.stopPropagation()
        this.$emit("open", {
          rowId  : this.rowId
        })
      }
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
  mounted : function() {
    this.doAutoActived()
  }
  ///////////////////////////////////////////////////
}