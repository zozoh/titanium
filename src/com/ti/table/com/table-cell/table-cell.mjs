/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data: ()=>({
    isEditingMode : false,
    cellItems : []
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
    "explainDict" : {
      type : Function,
      default : _.identity
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
    topClass() {
      return Ti.Css.mergeClassName({
        "is-self-actived" : this.isSelfActived,
        "is-actived" : this.isActived,
        "is-nowrap" : this.nowrap,
        "is-editing-mode" : this.isEditingMode
      }, this.className)
    },
    //-----------------------------------------------
    topStyle() {
      if(this.cellSize > 0) {
        return Ti.Css.toStyle({
          "width" : this.cellSize
        })
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
            explainDict : this.explainDict,
            autoIgnoreNil : true
        })
        if(it) {
          items.push(it)
        }
      }
      // Update and return
      this.cellItems = items

      // make table resizing
      this.$parent.$parent.debounceEvalEachColumnSize()
    },
    //-----------------------------------------------
    onItemChanged(item, payload) {
      this.$emit('item:changed', {name:item.key, value:payload})
    }
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
    },
    "isActived" : async function() {
      await this.evalCellDisplayItems()
    },
    "cellSize" : async function() {
      await this.debounceEvalCellDisplayItems()
    }
  },
  ///////////////////////////////////////////////////
  created : function() {
    this.debounceEvalCellDisplayItems = _.debounce(()=>{
      this.evalCellDisplayItems()
    }, 20)
  },
  ///////////////////////////////////////////////////
  mounted : function() {
    this.debounceEvalCellDisplayItems()
  }
  ///////////////////////////////////////////////////
}