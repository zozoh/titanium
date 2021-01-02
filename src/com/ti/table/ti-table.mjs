const _M = {
  ///////////////////////////////////////////////////
  provide : function(){
    return {
      "$table" : this
    }
  },
  ///////////////////////////////////////////////////
  data : ()=>({
    myTableRect: null,
    myData : []
  }),
  ///////////////////////////////////////////////////
  // props -> ti-table-props.mjs
  ///////////////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      let klass = this.getTopClass({
        // "is-cells-no-ready" : !this.myCellsReady,
        // "is-layout-ready" : this.myCellsReady,
        "is-hoverable"   : this.hoverable
      }, [
        `is-border-${this.border}`,
        `is-head-${this.head||"none"}`
      ])
      // Auto judgement table layout
      if(!klass['is-layout-fixed'] && !klass['is-layout-auto']) {
        let tableLayout = "auto"
        for(let i=0; i< this.fields.length; i++) {
          let fld = this.fields[i]
          if(!Ti.Util.isNil(fld.width)){
            tableLayout = "fixed"
            break
          }
        }
        klass[`is-layout-${tableLayout}`] = true
      }
      return klass
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    },
    //--------------------------------------
    TableStyle() {
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
    TheData() {
      return this.myData
    },
    //--------------------------------------
    isShowHead() {
      return /^(frozen|normal)$/.test(this.head)
    },
    //--------------------------------------
    HeadCheckerIcon() {
      if(this.isAllChecked) {
        return "fas-check-square"
      }
      if(this.hasChecked) {
        return "fas-minus-square"
      }
      return "far-square"
    },
    //--------------------------------------
    TableFields() {
      if(!this.myTableRect) {
        return
      }
      let fields = []
      for(let i=0; i< this.fields.length; i++) {
        let fld = this.fields[i]
        //..................................
        let display = this.evalFieldDisplay(fld.display, fld.name)
        //..................................
        let fldWidth = Ti.Util.fallbackNil(fld.width, "stretch")
        //..................................
        if(_.isString(fldWidth)) {
          // Percent
          if(/^\d+(\.\d+)?%$/.test(fldWidth)) {
            fldWidth = fldWidth.substring(0, fldWidth.length-1)/100;
          }
          // Auto or stretch
          else if(!/^(auto|stretch)$/.test(fldWidth)) {
            fldWidth = "stretch"
          }
        }
        // Must be number
        else if(!_.isNumber(fldWidth)) {
          fldWidth = "stretch"
        }
        //..................................
        let cell = {
          index  : i,
          title  : fld.title,
          nowrap : fld.nowrap,
          width  : fldWidth,
          className : fld.className,
          //.....................
          name : fld.name,
          display,
          //.....................
          type : fld.type,
          comType : fld.comType,
          comConf : fld.comConf,
          transformer : fld.transformer,
          serializer  : fld.serializer
        }
        //..................................
        cell.headStyle = this.getHeadCellStyle(cell)
        //..................................
        fields.push(cell)
        //..................................
      }
      return fields
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickHeadChecker() {
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
    OnClickTop($event) {
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
      this.$notify("item:change", payload)
    },
    //--------------------------------------
    getHeadCellStyle(fld) {
      if(fld && !Ti.Util.isNil(fld.width) 
          && this.myTableRect && this.myTableRect.width > 0) {
          // Copy width
          let width = fld.width

          // Number
          if(_.isNumber(width)) {
            // -100: it will conver to percent
            if(width < 0) {
              let per = Math.abs(width / this.myTableRect.width)
              width = Math.round(per * 100) + "%"
            }
            // 0-1: => Percent
            else if(width>=0 && width < 1) {
              width = Math.round(width * 100) + "%"
            }
            // 100: => pixcel
            else {
              width = `${width}px`
            }
          }

          return {width}
      }
    },
    //--------------------------------------
    evalFieldDisplay(displayItems=[], defaultKey) {
      // Force to Array
      displayItems = _.concat(displayItems)
      // Prepare the return list
      let items = []
      // Loop each items
      for(let li of displayItems) {
        let item = this.evalFieldDisplayItem(li, {defaultKey})
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
    scrollCurrentIntoView() {
      //console.log("scrollCurrentIntoView", this.myLastIndex)
      if(this.autoScrollIntoView && this.theCurrentId) {
        let index = this.findRowIndexById(this.theCurrentId)
        //console.log("scroll", index)
        let $view = this.$el
        let $row  = Ti.Dom.find(`.table-row:nth-child(${index+1})`, $view)

        if(!_.isElement($view) || !_.isElement($row)) {
          return
        }

        let r_view = Ti.Rects.createBy($view)
        let r_row = Ti.Rects.createBy($row)

        // test it need to scroll or not
        if(!r_view.contains(r_row)) {
          // at bottom
          if(r_row.bottom > r_view.bottom) {
            $view.scrollTop += r_row.bottom - r_view.bottom
          }
          // at top
          else {
            $view.scrollTop += r_row.top - r_view.top
          }
        }
      }
    },
    //--------------------------------------
    OnResize() {
      this.myTableRect = Ti.Rects.createBy(this.$el)
    },
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-table", uniqKey)
      if("ARROWUP" == uniqKey) {
        this.selectPrevRow({
          payload: {byKeyboardArrow: true}
        })
        this.scrollCurrentIntoView()
        return {prevent:true, stop:true, quit:true}
      }

      if("ARROWDOWN" == uniqKey) {
        this.selectNextRow({
          payload: {byKeyboardArrow: true}
        })
        this.scrollCurrentIntoView()
        return {prevent:true, stop:true, quit:true}
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "data" : {
      handler : async function(newVal, oldVal){
        let isSame = _.isEqual(newVal, oldVal)
        if(!isSame) {
          //console.log("!!!table data changed", {newVal, oldVal})
          this.myData = await this.evalData((it)=>{
            it.icon = this.getRowIcon(it.item)
            it.indent = this.getRowIndent(it.item)
          })
        }
        // Check ready 
        if(_.isEmpty(this.data)) {
          this.$nextTick(()=>{
            this.myCellsReady = true
          })
        }
      },
      immediate : true
    }
  },
  ///////////////////////////////////////////////////
  mounted : function() {
    Ti.Viewport.watch(this, {
      resize : _.debounce(()=>this.OnResize(), 10)
    })
    this.$nextTick(()=>this.OnResize())
    if(this.autoScrollIntoView) {
      _.delay(()=>{
        this.scrollCurrentIntoView()
      }, 0)
    }
    // Eval the table viewport Rect
    this.myTableRect = Ti.Rects.createBy(this.$el)
  },
  ///////////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////////////////////
}
export default _M;