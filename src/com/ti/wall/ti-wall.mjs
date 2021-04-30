const _M = {
  ///////////////////////////////////////////////////
  provide : function(){
    return {
      "$wall" : this
    }
  },
  //////////////////////////////////////////
  data : ()=>({
    myData : [],

    myColCount : 0,
    myColWidth : 0,
    isOnlyOneRow : false,

    myCellsReport : {},
    myNeedResize : true
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
    },
    "resizeDelay" : {
      type : Number,
      default : 0
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
      return this.evalFieldDisplayItem(this.display)
    },
    //--------------------------------------
    TheData() {
      return this.myData
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
      let $divs = Ti.Dom.findAll(".wall-con > .wall-tile", this.$el)
      // Guard empty
      if(_.isEmpty($divs)) 
        return
      // Eval the cols and width
      //console.log("  ~~~ do", this.data)
      let cols  = 0
      let width = 1
      let top = undefined
      let isOnlyOneRow = true
      for(let $div of $divs) {
        let rect = $div.getBoundingClientRect()
        if(_.isUndefined(top)) {
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
        this.myCellsReport[key] = false
        this.myNeedResize = true
      }
      // Check the status
      if(isDone) {
        _.delay(()=>{
          let allReady = _.isEmpty(this.myCellsReport)
          // Do resize
          if(allReady && this.myNeedResize) {
            _.delay(()=>{
              this.OnWallResize()
            }, this.resizeDelay)
            this.myNeedResize = false
          }
        })
      }
    },
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "data" : {
      handler : async function(newVal, oldVal){
        let isSame = _.isEqual(newVal, oldVal)
        if(!isSame) {
          //console.log("!!!wall data changed", {newVal, oldVal})
          this.myData = await this.evalData()
        }
      },
      immediate : true
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    //.................................
    Ti.Viewport.watch(this, {
      resize : _.debounce(()=>this.OnWallResize(), 20)
    })
    //.................................
  },
  //////////////////////////////////////////
  destroyed : function() {
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////
}
export default _M;