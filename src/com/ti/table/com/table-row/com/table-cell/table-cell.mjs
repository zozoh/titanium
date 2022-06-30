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
    }
    //..........................
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    TopClass() {
      let hasAlign = this.className && this.className.indexOf("align-")>=0
      return this.getTopClass({
        "has-align" : hasAlign,
        "not-align" : !hasAlign
      })
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
      let items = []
      // Eval each items
      for(let i=0; i<this.theCurrentDisplayItems.length; i++) {
        let displayItem = this.theCurrentDisplayItems[i]
        let it = await this.evalDataForFieldDisplayItem({
            itemData : this.data, 
            displayItem, 
            vars : {
              "rowId"     : this.rowId,
              "isCurrent" : this.isCurrent
            },
            autoIgnoreNil : true,
            uniqKey: `row${this.rowId}-cell${this.index}-${i}`
        })
        if(it) {
          items.push(it)
        }
      }
      //if(0 == this.rowIndex && 1==this.index) {
      //console.log("evalCellDisplayItems", this.rowIndex, this.index)
      //}
      // Update and return
      let old = Ti.Util.pureCloneDeep(this.cellItems)
      let nit = Ti.Util.pureCloneDeep(items)
      if(!_.isEqual(old, nit)) {
        //console.log(`-> Cell[${this.rowIndex}-${this.index}]:`, {old, nit})
        this.cellItems = items
      }
    },
    //-----------------------------------------------
    OnItemChanged(item, payload) {
      this.$table.$notify("cell:item:change", {
        rowId     : this.rowId,
        rowData   : this.data,
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
    "display" : "evalCellDisplayItems"
  }
  ///////////////////////////////////////////////////
}
export default _M;