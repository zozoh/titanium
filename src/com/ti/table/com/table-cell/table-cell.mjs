/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
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
    topClass() {
      return this.getTopClass({
        "is-nowrap" : this.nowrap,
        "is-editing-mode" : this.isEditingMode
      })
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
      // if(this.data && this.data.title && this.data.type) {
      //   console.log("evalCellDisplayItems", this.data)
      // }
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
      // Update and return
      this.cellItems = items

      // make table resizing
      if(this.cellSize != this.myCellSize) {
        this.myCellSize = this.cellSize
        this.$nextTick(()=>{
          this.$parent.$parent.debounceEvalEachColumnSize()
        })
      }
    },
    //-----------------------------------------------
    onItemChanged(item, payload) {
      this.$emit('item:changed', {name:item.key, value:payload})
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "data" : async function(newVal, oldVal) {
      if(!_.isEqual(newVal, oldVal)) {
        //console.log(_.isEqual(newVal, oldVal), newVal, oldVal)
        await this.evalCellDisplayItems()
      }
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