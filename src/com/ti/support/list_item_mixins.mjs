export default {
  inject: ["$vars"],
  ///////////////////////////////////////////////////
  data: ()=>({
    groupTitleComs: []
  }),
  ///////////////////////////////////////////////////
  props : {
    "index" : {
      type : Number,
      default : -1
    },
    "displayIndex" : {
      type : Number,
      default : -1
    },
    "rowNumberBase" : {
      type : Number,
      default : undefined
    },
    "asGroupTitle" : {
      type : Boolean,
      default: false
    },
    "groupTitleDisplay" : {
      type : Array
    },
    "rowId" : {
      type : String,
      default : undefined
    },
    "data" : undefined,
    "item" : {
      type : Object,
      default : ()=>({})
    },
    "changedId" : {
      type : String,
      default : undefined
    },
    "currentId" : {
      type : String,
      default : undefined
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
    hasRowNumber() {
      return !this.asGroupTitle && _.isNumber(this.rowNumberBase)
    },
    //-----------------------------------------------
    RowNumber() {
      if(this.hasRowNumber) {
        return this.rowNumberBase + this.displayIndex
      }
    },
    //-----------------------------------------------
    hasGroupTitleComs() {
      return !_.isEmpty(this.groupTitleComs)
    },
    //-----------------------------------------------
    hasRowId() {
      return !Ti.Util.isNil(this.rowId)
    },
    //-----------------------------------------------
    isCurrent() {
      return this.hasRowId && this.rowId == this.currentId
    },
    //-----------------------------------------------
    isChanged() {
      return this.hasRowId && this.rowId == this.changedId
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
    },
    //-----------------------------------------------
    async evalGroupTitleDisplayCom() {
      if(this.asGroupTitle && !_.isEmpty(this.groupTitleDisplay)) {
        let coms = []
        for(let displayItem of this.groupTitleDisplay) {
          let com = await this.$parent.evalDataForFieldDisplayItem({
            itemData : this.data, 
            displayItem, 
            vars : {
              "rowId"     : this.rowId,
              "isCurrent" : this.isCurrent
            },
            autoIgnoreNil : false,
          })
          coms.push(com)
        }
        this.groupTitleComs = coms;
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "isCurrent" : function() {
      this.doAutoActived()
    },
    "data" : "evalGroupTitleDisplayCom",
    "groupTitleDisplay" : "evalGroupTitleDisplayCom"
  },
  ///////////////////////////////////////////////////
  mounted : async function() {
    this.doAutoActived()
    await this.evalGroupTitleDisplayCom()
  }
  ///////////////////////////////////////////////////
}