export default {
  inject: ["$vars"],
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
    "rowToggleKey" : {
      type : Array,
      default : ()=>[]
    },
    "checkIcons" : {
      type : Object,
      default : ()=>({
        on  : "fas-check-square",
        off : "far-square"
      })
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    getListItemClass() {
      return (...klass)=>this.getTopClass({
        "is-current" : this.isCurrent,
        "is-checked" : this.isChecked,
        "is-changed" : this.isChanged,
        "no-checked" : !this.isChecked
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
    isRowToggleKey(uniqKey) {
      return _.indexOf(this.rowToggleKey, uniqKey)>=0
    },
    //-----------------------------------------------
    OnClickChecker($event={}) {
      if(this.checkable) {
        this.$notify("checker", {
          rowId  : this.rowId,
          shift  : $event.shiftKey,
          toggle : ($event.ctrlKey || $event.metaKey)
        })
      }
    },
    //-----------------------------------------------
    OnClickRow($event={}) {
      let toggle = ($event.ctrlKey || $event.metaKey)
      if(this.selectable && (!this.isCurrent || !this.isChecked || toggle)) {
        this.$notify("select", {
          rowId  : this.rowId,
          shift  : $event.shiftKey,
          toggle
        })
      }
    },
    //-----------------------------------------------
    OnDblClickRow($event={}) {
      if(this.openable) {
        $event.stopPropagation()
        this.$notify("open", {
          rowId  : this.rowId
        })
      }
    },
    //-----------------------------------------------
    doAutoActived() {
      if(!this.isActived && this.isCurrent) {
        this.setActived()
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