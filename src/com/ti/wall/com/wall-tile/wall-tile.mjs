export default {
  ///////////////////////////////////////////////////
  inject: ["$wall"],
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
    TopClass() {
      return this.getListItemClass()
    },
    //--------------------------------------
    TopStyle() {
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
    doThis() {
      console.log(arguments)
    },
    //-----------------------------------------------
    async evalMyDisplayCom() {
      this.$wall.reportReady(this.index, !Ti.Util.isNil(this.myCom))
      let com = await this.evalDataForFieldDisplayItem({
        itemData : this.data, 
        displayItem : this.display, 
        vars : {
          "isCurrent" : this.isCurrent,
          "isChecked" : this.isChecked,
          "isChanged" : this.isChanged,
          "isActived" : this.isActived,
          "rowId"     : this.rowId,
          ... this.$vars
        }
      })

      // Update and return
      let old = Ti.Util.pureCloneDeep(this.myCom)
      let nit = Ti.Util.pureCloneDeep(com)
      if(!_.isEqual(old, nit)) {
        //console.log(`-> Cell[${this.rowIndex}-${this.index}]:`, {old, nit})
        this.myCom = com
      }
      // report ready
      this.$wall.reportReady(this.index, true)
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "data" : {
      handler : "evalMyDisplayCom",
      immediate : true
    },
    "isCurrent" : "evalMyDisplayCom",
    "isChecked" : "evalMyDisplayCom"
  }
  ///////////////////////////////////////////////////
}