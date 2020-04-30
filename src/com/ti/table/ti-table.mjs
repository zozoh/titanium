export default {
  ///////////////////////////////////////////////////
  provide : function(){
    return {
      "$table" : this
    }
  },
  ///////////////////////////////////////////////////
  data : ()=>({
    myData : [],
    myHoverId  : null,    // The row mouse hover
  }),
  ///////////////////////////////////////////////////
  // props -> ti-table-props.mjs
  ///////////////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-cells-no-ready" : !this.myCellsReady,
        "is-layout-ready" : this.myCellsReady,
        "is-hoverable"   : this.hoverable
      }, [
        `is-border-${this.border}`,
        `is-head-${this.head||"none"}`,
      ])
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
    OnRowEnter({rowId}={}) {
      if(this.hoverable) {
        this.myHoverId = rowId
      }
    },
    //--------------------------------------
    OnRowLeave({rowId}={}) {
      if(this.hoverable) {
        if(this.myHoverId == rowId) {
          this.myHoverId = null
        }
      }
    },
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
    getHeadCellStyle(index=-1) {
      if(this.myColSizes.amended.length > index) {
        return Ti.Css.toStyle({
          "width" : this.myColSizes.amended[index]
        })
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
          this.myCellsReady = true
        }
      },
      immediate : true
    }
  }
  ///////////////////////////////////////////////////
}