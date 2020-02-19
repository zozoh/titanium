export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    myCom : null
  }),
  ///////////////////////////////////////////////////
  props : {
    "className" : null,
    "index" : {
      type : Number,
      default : -1
    },
    "rowId" : {
      type : String,
      default : null
    },
    "display" : {
      type : Object,
      default : null
    },
    "data" : {
      type : Object,
      default : null
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
    "explainDict" : {
      type : Function,
      default : _.identity
    },
    // Wall-Tile width
    "width" : {
      type : [String, Number],
      default : null
    },
    // Wall-Tile height
    "height" : {
      type : [String, Number],
      default : null
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
        "is-changed" : this.isChanged
      }, this.className)
    },
    //--------------------------------------
    topStyle() {
      let css = {}
      if(this.width) {
        css.width = this.width
      }
      if(this.height) {
        css.height = this.height
      }
      return Ti.Css.toStyle(css)
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
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    async evalCellDisplayItems() {
      this.myCom = await this.evalDataForFieldDisplayItem({
        itemData : this.data, 
        displayItem : this.display, 
        vars : {
          "isCurrent" : this.isCurrent,
          "isChecked" : this.isChecked,
          "isChanged" : this.isChanged,
          "isActived" : this.isActived,
          "rowId"     : this.rowId
        },
        explainDict : this.explainDict
      })

      // make table resizing
      this.$parent.debounceOnWallResize()
    },
    //-----------------------------------------------
    onClickTile($event) {
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
    onDblClickTile($event) {
      if(this.openable) {
        $event.stopPropagation()
        this.$emit("open", {
          rowId  : this.rowId
        })
      }
    },
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "display" : async function() {
      await this.evalCellDisplayItems()
    },
    "data" : async function() {
      //console.log("data changed")
      await this.evalCellDisplayItems()
    },
    "isCurrent" : async function() {
      await this.evalCellDisplayItems()
    },
    "isChecked" : async function() {
      await this.evalCellDisplayItems()
    },
    "isHover" : async function() {
      await this.evalCellDisplayItems()
    }
  },
  ///////////////////////////////////////////////////
  mounted : async function() {
    await this.evalCellDisplayItems()
  }
  ///////////////////////////////////////////////////
}