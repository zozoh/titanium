export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  data : ()=>({
    myHoverId  : null,    // The row mouse hover
    myViewportWidth : 0,  // Update-in-time, root element width
    myTableWidth: 0,      // Update-in-time, table width
    myColSizes: {
      priHead : [],  // Primary head column sizing
      priBody : [],  // Primary body column sizing
      primary : [],  // Primary Max Col-Sizes
      fixeds  : [],  // Fixed value [480, .23, 'auto', 'stretch']
                     // Eval when `evalEachColumnSize`
                     //  - 480 : fixed width
                     //  - -480 : fixed width and override primary
                     //  - .23 : as percent eval each time resize
                     //  - 'auto' : it will keep the primary sizing
                     //  - 'stretch' : it will join to the auto-remains-assignment
      amended : []   // The col-size to display in DOM
    },
    whenTableLayout: false, 
  }),
  ///////////////////////////////////////////////////
  // props -> ti-table-props.mjs
  ///////////////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return this.getTopClass({
        "is-when-layout" : this.whenTableLayout,
        "is-hoverable"    : this.hoverable
      }, [
        `is-border-${this.border}`,
        `is-head-${this.head||"none"}`,
      ])
    },
    //--------------------------------------
    tableStyle() {
      if(this.myTableWidth>0) {
        return Ti.Css.toStyle({
          "width" : this.myTableWidth
        })
      }
    },
    //--------------------------------------
    getRowIndent() {
      if(_.isFunction(this.indentBy)) {
        return it => this.indentBy(it)
      }
      if(_.isString(this.indentBy)) {
        return it => _.get(it, this.indentBy)
      }
      return it => 0
    },
    //--------------------------------------
    getRowIcon() {
      if(_.isFunction(this.iconBy)) {
        return it => this.iconBy(it)
      }
      if(_.isString(this.iconBy)) {
        return it => _.get(it, this.iconBy)
      }
      return it => null
    },
    //--------------------------------------
    theData() {
      return this.evalData((it)=>{
        it.icon = this.getRowIcon(it.item)
        it.indent = this.getRowIndent(it.item)
      })
    },
    //--------------------------------------
    isShowHead() {
      return /^(frozen|normal)$/.test(this.head)
    },
    //--------------------------------------
    theHeadCheckerIcon() {
      if(this.isAllChecked) {
        return "fas-check-square"
      }
      if(this.hasChecked) {
        return "fas-minus-square"
      }
      return "far-square"
    },
    //--------------------------------------
    theTableFields() {
      let fields = []
      for(let i=0; i< this.fields.length; i++) {
        let fld = this.fields[i]
        //..................................
        let display = this.evalFieldDisplay(fld.display, fld.name)
        //..................................
        let fldWidth = Ti.Util.fallbackNil(fld.width, "stretch")
        //..................................
        if(_.isString(fldWidth)) {
          if(!/^(auto|stretch)$/.test(fldWidth)) {
            fldWidth = "stretch"
          }
        }
        // Must be number
        else if(!_.isNumber(fldWidth)) {
          fldWidth = "stretch"
        }
        //..................................
        fields.push({
          index  : i,
          title  : fld.title,
          nowrap : fld.nowrap,
          width  : fldWidth,
          //.....................
          name : fld.name,
          display,
          //.....................
          type : fld.type,
          comType : fld.comType,
          comConf : fld.comConf,
          transformer : fld.transformer,
          serializer  : fld.serializer
        })
      }
      return fields
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //--------------------------------------
    headCellStyle(index=-1) {
      if(this.myColSizes.amended.length > index) {
        return Ti.Css.toStyle({
          "width" : this.myColSizes.amended[index]
        })
      }
    },
    //--------------------------------------
    onRowEnter({rowId}={}) {
      if(this.hoverable) {
        this.myHoverId = rowId
      }
    },
    //--------------------------------------
    onRowLeave({rowId}={}) {
      if(this.hoverable) {
        if(this.myHoverId == rowId) {
          this.myHoverId = null
        }
      }
    },
    //--------------------------------------
    onClickHeadChecker() {
      // Cancel All
      if(this.isAllChecked) {
        this.cancelRow()
      }
      // Check All
      else {
        this.checkRow()
      }
    },
    //--------------------------------------
    onClickTop($event) {
      if(this.cancelable) {
        // Click The body or top to cancel the row selection
        if(Ti.Dom.hasOneClass($event.target,
            'ti-table', 'table-body',
            'table-head-cell',
            'table-head-cell-text')) {
          this.cancelRow()
        }
      }
    },
    //--------------------------------------
    onItemChanged(payload) {
      this.$emit("item:changed", payload)
    },
    //--------------------------------------
    evalFieldDisplay(displayItems=[], defaultKey) {
      // Force to Array
      displayItems = _.concat(displayItems)
      // Prepare the return list
      let items = []
      // Loop each items
      for(let li of displayItems) {
        let item = this.evalFieldDisplayItem(li, {
          funcSet: this.fnSet,
          defaultKey
        })
        if(item) {
          items.push(item)
        }
      }
      // // Gen transformer for each item
      // for(let it of items) {
      //   // Transformer
      //   it.transformer = Ti.Types.getFuncBy(it, "transformer", this.fnSet)
      // }
      // Array to pick
      return items
    },
    //--------------------------------------
    evalEachColumnSize() {
      //console.log("evalEachColumnSize")
      // Reset each column size
      this.whenTableLayout = true
      this.myTableWidth = 0
      this.myColSizes = {
        priHead : [],
        priBody : [],
        primary : [],
        fixeds  : [],
        amended : []
      }
      //.........................................
      // Eval the fixeds
      for(let fld of this.theTableFields) {
        let fldWidth = fld.width || "stretch"
        // Stretch/Auto
        if(/^(stretch|auto)$/.test(fldWidth)) {
          this.myColSizes.fixeds.push(fldWidth)
        }
        // Fixed or percent
        else {
          this.myColSizes.fixeds.push(Ti.Css.toPixel(fldWidth, 1))
        }
      }
      //.........................................
      // Wait reset applied, and ...
      this.$nextTick(()=>{
        this.whenTableLayout = false
        // Get original size: head
        let $heads = Ti.Dom.findAll(".table-head ul li", this.$el)
        for(let $he of $heads) {
          let rect = Ti.Rects.createBy($he)
          this.myColSizes.priHead.push(rect.width)
        }

        // Get original size: body
        let $rows = Ti.Dom.findAll(".table-body .table-row", this.$el)
        for(let $row of $rows) {
          let $cells = Ti.Dom.findAll(":scope > div", $row)
          for(let x=0; x<$cells.length; x++) {
            let $cell = $cells[x]
            let rect = Ti.Rects.createBy($cell)
            if(x>= this.myColSizes.priBody.length) {
              this.myColSizes.priBody[x] = rect.width
            } else {
              this.myColSizes.priBody[x] = Math.max(
                rect.width, this.myColSizes.priBody[x]
              )
            }
          }
        }

        // Count the primary max sizing for each columns
        for(let i=0; i<this.myColSizes.priHead.length; i++) {
          let wHeadCell = this.myColSizes.priHead[i]
          let wBodyCell = this.myColSizes.priBody[i]
          let w = Math.max(wHeadCell, wBodyCell)
          this.myColSizes.primary.push(w)
        }

        // Resize Table
        this.onTableResize()
      })
    },
    //--------------------------------------
    onTableResize() {
      // Guard it
      let colN = this.myColSizes.primary.length
      if(colN <= 0) {
        return
      }

      // Get the viewport width
      let viewportWidth = Ti.Rects.createBy(this.$el).width

      // Assign the fixed width
      // And count how many fields to join the remains-assignment
      let raIndexs = [];
      let amended = []
      for(let i=0; i<this.myColSizes.fixeds.length; i++) {
        let fxW = this.myColSizes.fixeds[i]
        // Get the primary width
        let priW = this.myColSizes.primary[i]
        // join to auto-remains-assignment
        if("stretch" == fxW) {
          raIndexs.push(i)
          amended.push(priW)
        }
        // keep primary
        else if("auto" == fxW) {
          amended.push(priW)
        }
        // Eval percent
        else if(fxW <= 1 && fxW > 0) {
          amended.push(fxW * viewportWidth)
        }
        // Eval percent and join remains-assignment
        else if(fxW < 0 && fxW >= -1) {
          let w = Math.abs(fxW * viewportWidth)
          amended.push(Math.max(w, priW))
        }
        // Fixed width and join remains-assignment
        else if(fxW < -1) {
          let w = Math.abs(fxW)
          amended.push(Math.max(w, priW))
        }
        // Fixed width
        else {
          amended.push(fxW)
        }
      }

      // Count the tableWidth
      let sumWidth = _.sum(amended)
      let tableWidth = Math.max(viewportWidth, sumWidth)
      this.myTableWidth = tableWidth

      // Assign the remain
      if(raIndexs.length > 0) {
        let remain = tableWidth - sumWidth
        if(remain > 0) {
          let remainCell = remain / raIndexs.length
          for(let index of raIndexs) {
            amended[index] += remainCell
          }
        }
      }

      // apply amended
      this.myColSizes.amended = amended
    },
    //--------------------------------------
    scrollCurrentIntoView() {
      if(this.autoScrollIntoView && this.myLastIndex>=0) {
        let $tbody = this.$refs.body
        let $row = Ti.Dom.find(`.table-row:nth-child(${this.myLastIndex+1})`, $tbody)

        let tbody = Ti.Rects.createBy($tbody)
        let row = Ti.Rects.createBy($row)

        // test it need to scroll or not
        if(!tbody.contains(row)) {
          // at bottom
          if(row.bottom > tbody.bottom) {
            $tbody.scrollTop += row.bottom - tbody.bottom
          }
          // at top
          else {
            $tbody.scrollTop += row.top - tbody.top
          }
        }
      }
    },
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-table", uniqKey)
      if("ARROWUP" == uniqKey) {
        this.selectPrevRow()
        this.scrollCurrentIntoView()
        return {prevent:true}
      }

      if("ARROWDOWN" == uniqKey) {
        this.selectNextRow()
        this.scrollCurrentIntoView()
        return {prevent:true}
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  created : function() {
    //.................................
    // Define the method for sub-cells up-calling
    this.debounceEvalEachColumnSize = _.debounce(()=>this.evalEachColumnSize(), 50)
  },
  ///////////////////////////////////////////////////
  mounted : async function() {
    //.................................
    Ti.Viewport.watch(this, {
      resize : _.debounce(()=>this.onTableResize(), 100)
    })
    //.................................
  },
  ///////////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////////////////////
}