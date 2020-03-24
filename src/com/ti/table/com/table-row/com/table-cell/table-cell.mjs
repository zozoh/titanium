/////////////////////////////////////////////////////
const _M = {
  ///////////////////////////////////////////////////
  inject : ["$table"],
  ///////////////////////////////////////////////////
  data: ()=>({
    isEditingMode : false,
    cellItems : [],
    myCellSize : -1
  }),
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
    "rowIndex" : {
      type : Number,
      default : -1
    },
    //..........................
    "cellSize" : {
      type : Number,
      default : 0
    },
    "title" : {
      type : String,
      default : null
    },
    "nowrap" : {
      type : Boolean,
      default : true
    },
    //..........................
    "display" : {
      type : Array,
      default : ()=>[]
    },
    //..........................
    "name" : {
      type : [String, Array],
      default : null
    },
    "type" : {
      type : String,
      default : "String"
    },
    "dict" : {
      type : String,
      default : "String"
    },
    "comType" : {
      type : String,
      default : null
    },
    "comConf" : {
      type : Object,
      default : ()=>({})
    },
    "serializer" : {
      type : Function,
      default : _.identity
    },
    "transformer" : {
      type : Function,
      default : _.identity
    },
    //..........................
    "data" : {
      type : Object,
      default : ()=>({})
    },
    //..........................
    "isCurrent" : {
      type : Boolean,
      default : false
    },
    "isHover" : {
      type : Boolean,
      default : false
    },
    "isChecked" : {
      type : Boolean,
      default : false
    },
    //..........................
    "ignoreNil" : {
      type : Boolean,
      default : true
    },
    //..........................
    "focusBy" : {
      type : String,
      default : "focus"
    },
    "widthBy" : {
      type : String,
      default : "width"
    }
    //..........................
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //-----------------------------------------------
    TopStyle() {
      if(this.cellSize > 0) {
        return Ti.Css.toStyle({
          "width" : this.cellSize
        })
      }
    },
    //-----------------------------------------------
    WrapperClass() {
      return {
        "is-nowrap" : this.nowrap,
        "is-editing-mode" : this.isEditingMode
      }
    },
    //-----------------------------------------------
    theCurrentDisplayItems() {
      // Edit Mode
      if((this.isActived && this.comType) || _.isEmpty(this.display)) {
        //...........................................
        this.isEditingMode = true
        //...........................................
        let comConf = _.assign({}, this.comConf)
        if(this.focusBy) {
          comConf[this.focusBy] = "${=isActived}"
        }
        if(this.widthBy) {
          comConf[this.widthBy] = "${=cellSize}"
        }
        //...........................................
        return [{
          comType : this.comType,
          comConf,
          key  : this.name,
          type : this.type,
          dict : this.dict,
          transformer : this.transformer,
          ignoreNil : false
        }]
        //...........................................
      }
      // Display Mode
      this.isEditingMode = false
      return this.display
    },
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    async evalCellDisplayItems() {
      this.$table.reportReady(this.rowIndex, this.index, !_.isEmpty(this.cellItems))
      let items = []
      // Eval each items
      for(let displayItem of this.theCurrentDisplayItems) {
        let it = await this.evalDataForFieldDisplayItem({
            itemData : this.data, 
            displayItem, 
            vars : {
              "isCurrent" : this.isCurrent,
              "isChecked" : this.isChecked,
              "isHover"   : this.isHover,
              "isActived" : this.isActived,
              "rowId"     : this.rowId,
              "cellSize"  : this.cellSize
            },
            autoIgnoreNil : true
        })
        if(it) {
          items.push(it)
        }
      }
      //if(0 == this.rowIndex && 1==this.index) {
      //  console.log("evalCellDisplayItems", this.rowIndex, this.index)
      //}
      // Update and return
      let old = Ti.Util.pureCloneDeep(this.cellItems)
      let nit = Ti.Util.pureCloneDeep(items)
      if(!_.isEqual(old, nit)) {
        //console.log(`-> Cell[${this.rowIndex}-${this.index}]:`, {old, nit})
        this.cellItems = items
      }
      // report ready
      this.$table.reportReady(this.rowIndex, this.index, true)
    },
    //-----------------------------------------------
    OnItemChanged(item, payload) {
      this.$table.$notify("cell:item:change", {
        rowId     : this.rowId,
        cellIndex : this.index,
        index     : this.rowIndex,
        name      : item.key,
        value     : payload
      })
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "data" : {
      handler : "evalCellDisplayItems",
      immediate : true
    },
    "isCurrent" : "evalCellDisplayItems",
    "isChecked" : "evalCellDisplayItems",
    "isHover"   : "evalCellDisplayItems",
    "isActived" : "evalCellDisplayItems"
    // "cellSize" : async function() {
    //   await this.debounceEvalCellDisplayItems()
    // }
  }
  ///////////////////////////////////////////////////
}
export default _M;