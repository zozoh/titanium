////////////////////////////////////////////
export default {
  ///////////////////////////////////////////////////
  provide : function(){
    return {
      "$wall" : this,
      "$NotifyBy" : (name, ...args)=>{
        this.$emit(name, ...args)
      }
    }
  },
  //////////////////////////////////////////
  data : ()=>({
    myColCount : 0,
    myColWidth : 0,
    isOnlyOneRow : true,

    myCellsReady : false,
    myCellsReport : {}
  }),
  //////////////////////////////////////////
  props : {
    "itemClassName" : undefined,
    "display" : {
      type : [Object, String],
      default : ()=>({
        key : "..",
        comType : "ti-label"
      })
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
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-hoverable"    : this.hoverable,
        "show-border"     : this.border,
        "is-only-one-row" : this.isOnlyOneRow,
        "is-multi-rows"   : !this.isOnlyOneRow
      }, [
        `spacing-${this.spacing}`
      ])
    },
    //--------------------------------------
    ItemDisplay() {
      return this.evalFieldDisplayItem(this.display, {
        funcSet : this.fnSet
      })
    },
    //--------------------------------------
    TheData() {
      return this.evalData()
    },
    //--------------------------------------
    ListRealCount() {
      return this.TheData.length
    },
    //--------------------------------------
    BlankCols() {
      let list = []
      if(!_.isEmpty(this.TheData) 
        && this.myColCount > 0 
        && this.myColWidth > 1
        && !this.isOnlyOneRow) {
        // get list real count
        let n = this.ListRealCount % this.myColCount
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
    OnClickTop($event) {
      if(this.cancelable) {
        // Click The body or top to cancel the row selection
        if(Ti.Dom.hasOneClass($event.target,
            'ti-wall', 'wall-tile')) {
          this.cancelRow()
        }
      }
    },
    //--------------------------------------
    OnWallResize() {
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
    },
    //--------------------------------------
    reportReady(rowIndex=-1, isDone=false) {
      let key = `R${rowIndex}`
      //console.log(key, isDone)
      if(isDone) {
        delete this.myCellsReport[key]
      } else {
        this.myCellsReport[key] = isDone
      }
      // Check the status
      _.delay(()=>{
        this.myCellsReady = _.isEmpty(this.myCellsReport)
        // Do resize
        if(this.myCellsReady) {
          this.OnWallResize()
        }
      })
    },
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "data" : {
      handler : "OnWallResize",
      immediate : true
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    //.................................
    Ti.Viewport.watch(this, {
      resize : _.debounce(()=>this.OnWallResize(), 100)
    })
    //.................................
  },
  //////////////////////////////////////////
  destroyed : function() {
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////
}