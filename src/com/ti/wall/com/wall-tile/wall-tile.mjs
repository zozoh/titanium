export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    myCom : null
  }),
  ///////////////////////////////////////////////////
  props : {
    "display" : {
      type : Object,
      default : null
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
      return this.getListItemClass()
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
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    async evalMyDisplayCom() {
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
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "display" : async function() {
      await this.evalMyDisplayCom()
    },
    "data" : async function() {
      //console.log("data changed")
      await this.evalMyDisplayCom()
    },
    "isCurrent" : async function() {
      await this.evalMyDisplayCom()
    },
    "isChecked" : async function() {
      await this.evalMyDisplayCom()
    }
  },
  ///////////////////////////////////////////////////
  mounted : async function() {
    await this.evalMyDisplayCom()
  }
  ///////////////////////////////////////////////////
}