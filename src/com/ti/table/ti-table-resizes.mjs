export default {
  ///////////////////////////////////////////////////
  data : ()=>({
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
    myCellsReady : false,
    myCellsReport : {},
    I_am_in_resizing : false
  }),
  ///////////////////////////////////////////////////
  methods : {
    //--------------------------------------
    reportReady(rowIndex=-1, cellIndex=-1, isDone=false) {
      let key = `R${rowIndex}-C${cellIndex}`
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
          this.evalEachColumnSize()
        }
      })
    },
    //--------------------------------------
    evalEachColumnSize() {
      // Guard
      if(this.I_am_in_resizing) {
        return
      }
      //console.log("evalEachColumnSize", this, this.tiComType)

      // Reset each column size
      this.I_am_in_resizing = true
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
      for(let fld of this.TableFields) {
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

        _.delay(()=>{
          this.I_am_in_resizing = false
        }, 10)
      })
    },
    //--------------------------------------
    onTableResize() {
      //console.log("onTableResize")
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
          raIndexs.push(i)
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
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  mounted : async function() {
    //.................................
    Ti.Viewport.watch(this, {
      resize : _.debounce(()=>this.onTableResize(), 200)
    })
    //.................................
  },
  ///////////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////////////////////
}