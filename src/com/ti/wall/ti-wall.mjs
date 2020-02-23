////////////////////////////////////////////
export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    myColCount : 0,
    myColWidth : 0,
    isOnlyOneRow : true
  }),
  //////////////////////////////////////////
  props : {
    "itemDisplay" : {
      type : [Object, String],
      default : ()=>({
        key : "..",
        comType : "ti-label"
      })
    },
    "itemClassName" : {
      type : String,
      default : null
    },
    // Wall-Tile width
    "itemWidth" : {
      type : [String, Number],
      default : null
    },
    // Wall-Tile height
    "itemHeight" : {
      type : [String, Number],
      default : null
    },
    "border" : {
      type : Boolean,
      default : true
    },
    // aspect: list item spacing
    // `no|xs|sm|md|lg|xl`
    "spacing" : {
      type : String,
      default : "sm"
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-self-actived" : this.isSelfActived,
        "is-actived"      : this.isActived,
        "is-hoverable"    : this.hoverable,
        "show-border"     : this.border,
        "is-only-one-row" : this.isOnlyOneRow,
        "is-multi-rows"   : !this.isOnlyOneRow
      }, [
        `spacing-${this.spacing}`
      ], this.className)
    },
    //--------------------------------------
    theItemDisplay() {
      return this.evalFieldDisplayItem(this.itemDisplay, {
        funcSet : this.extendFunctionSet
      })
    },
    //--------------------------------------
    theData() {
      return this.evalData()
    },
    //--------------------------------------
    theListRealCount() {
      return this.theData.length
    },
    //--------------------------------------
    blankCols() {
      let list = []
      if(!_.isEmpty(this.theData) 
        && this.myColCount > 0 
        && this.myColWidth > 1
        && !this.isOnlyOneRow) {
        // get list real count
        let n = this.theListRealCount % this.myColCount
        if(n > 0) {
          let nr = this.myColCount - n
          for(let i=0; i<nr; i++) {
            list.push({
              width : `${this.myColWidth}px`
            })
          }
        }
      }
      //console.log(list)
      return list
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    onClickTop($event) {
      if(this.cancelable) {
        // Click The body or top to cancel the row selection
        if(Ti.Dom.hasOneClass($event.target,
            'ti-wall', 'wall-tile')) {
          this.cancelRow()
        }
      }
    },
    //--------------------------------------
    onWallResize() {
      let $divs = Ti.Dom.findAll(":scope > .wall-tile", this.$el)
      // Guard empty
      if(_.isEmpty($divs)) 
        return
      // Eval the cols and width
      let cols  = 0
      let width = 1
      let top = -1
      let isOnlyOneRow = true
      for(let $div of $divs) {
        let rect = $div.getBoundingClientRect()
        if(top < 0) {
          top  = rect.top
        }
        if(top == rect.top) {
          cols ++
          width = Math.max(rect.width, width)
        }
        // Find the next row
        else {
          isOnlyOneRow = false
          break
        }
      }
      //console.log({cols, width, top})
      if(width > 1) {
        this.myColCount = cols
        this.myColWidth = width
        this.isOnlyOneRow = isOnlyOneRow
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "data" : function() {
      this.onWallResize()
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    //.................................
    this.$nextTick(()=>{
      this.onWallResize()
    })
    //.................................
    this.debounceOnWallResize = _.debounce(()=>this.onWallResize(), 100)
    //.................................
    Ti.Viewport.watch(this, {
      resize : ()=>this.debounceOnWallResize()
    })
    //.................................
  },
  //////////////////////////////////////////
  destroyed : function() {
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////
}