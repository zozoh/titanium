export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    myDisplayItems : []
  }),
  ///////////////////////////////////////////////////
  props : {
    "indent" : {
      type : Number,
      default : 0
    },
    "icon" : {
      type : [Boolean, String],
      default : null
    },
    "display" : {
      type : Array,
      default : ()=>[]
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    topClass() {
      return this.getListItemClass(`row-indent-${this.indent}`)
    },
    //-----------------------------------------------
    hasRealIcon() {
      return this.icon && _.isString(this.icon)
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    async evalMyDisplayItems() {
      let items = []
      // if(this.data && this.data.title && this.data.type) {
      //   console.log("evalCellDisplayItems", this.data)
      // }
      // Eval each items
      for(let displayItem of this.display) {
        let it = await this.evalDataForFieldDisplayItem({
            itemData : this.data, 
            displayItem, 
            vars : {
              "isCurrent" : this.isCurrent,
              "isChecked" : this.isChecked,
              "isChanged" : this.isChanged,
              "isActived" : this.isActived,
              "rowId"     : this.rowId
            }
        })
        if(it) {
          items.push(it)
        }
      }
      // Update and return
      this.myDisplayItems = items
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
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-list-row", uniqKey)
      if(!_.isEmpty(this.rowToggleKey)){
        if(this.isRowToggleKey(uniqKey)) {
          this.onClickChecker({})
          return {prevent:true, stop:true, quit:true}
        }
      }
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "display" : async function() {
      await this.evalMyDisplayItems()
    },
    "data" : async function() {
      //console.log("data changed")
      await this.evalMyDisplayItems()
    },
    "isCurrent" : async function() {
      await this.evalMyDisplayItems()
    },
    "isChecked" : async function() {
      await this.evalMyDisplayItems()
    }
  },
  ///////////////////////////////////////////////////
  mounted : async function() {
    await this.evalMyDisplayItems()
  }
  ///////////////////////////////////////////////////
}