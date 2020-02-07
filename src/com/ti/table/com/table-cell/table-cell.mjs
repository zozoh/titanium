/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data: ()=>({
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
    "display" : {
      type : Array,
      default : ()=>[]
    },
    "data" : {
      type : Object,
      default : ()=>({})
    },
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
        "is-nowrap" : this.nowrap
      }, this.className)
    },
    //-----------------------------------------------
    topStyle() {
      if(this.cellSize > 0) {
        return Ti.Css.toStyle({
          "width" : this.cellSize
        })
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    async evalCellDisplayItems() {
      let items = []
      // Eval each items
      for(let displayItem of this.display) {
        let it = await this.evalDataForFieldDisplayItem({
            itemData : this.data, 
            displayItem, 
            vars : {
              "isCurrent" : this.isCurrent,
              "isChecked" : this.isChecked,
              "isHover"   : this.isHover,
              "isActived" : this.isActived,
              "rowId"     : this.rowId
            },
            explainDict : this.explainDict
        })
        if(it) {
          items.push(it)
        }
      }
      // Update and return
      this.cellItems = items

      // make table resizing
      this.$parent.$parent.debounceEvalEachColumnSize()

      // Then return
      return items;
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
    }
  },
  ///////////////////////////////////////////////////
  mounted : async function() {
    await this.evalCellDisplayItems()
  }
  ///////////////////////////////////////////////////
}