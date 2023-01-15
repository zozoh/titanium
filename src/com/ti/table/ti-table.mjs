const _M = {
  ///////////////////////////////////////////////////
  data: () => ({
    virtualPageCount: 0,
    virtualScopeBegin: 0,
    virtualScopeEnd: -1,
    rowsRenderedAt: 0
  }),
  ///////////////////////////////////////////////////
  // props -> ti-table-props.mjs
  ///////////////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      let klass = this.getTopClass({
        // "is-cells-no-ready" : !this.myCellsReady,
        // "is-layout-ready" : this.myCellsReady,
        "is-hoverable": this.hoverable
      }, [
        `is-border-${this.border}`,
        `is-head-${this.head || "none"}`
      ])
      // Auto judgement table layout
      if (!klass['is-layout-fixed'] && !klass['is-layout-auto']) {
        let tableLayout = "auto"
        for (let i = 0; i < this.myFields.length; i++) {
          let fld = this.myFields[i]
          if (!Ti.Util.isNil(fld.width)) {
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
      if (this.myTableWidth > 0) {
        return Ti.Css.toStyle({
          "width": this.myTableWidth
        })
      }
    },
    //--------------------------------------
    RowScopeFrom() {
      return Math.max(this.virtualScopeBegin, 0)
    },
    //--------------------------------------
    RowScopeTo() {
      if (this.virtualScopeEnd < 0) {
        return this.data.length
      }
      return Math.min(this.virtualScopeEnd, this.data.length)
    },
    //--------------------------------------
    RowCheckIcons() {
      let re = {}
      _.forEach(this.checkIcons, (v, k) => {
        let ico = Ti.Icons.parseFontIcon(v)
        if (ico) {
          re[k] = ico.className
        }
      })
      return re
    },
    //--------------------------------------
    getRowIndent() {
      if (_.isFunction(this.indentBy)) {
        return it => this.indentBy(it)
      }
      if (_.isString(this.indentBy)) {
        return it => _.get(it, this.indentBy)
      }
      return it => 0
    },
    //--------------------------------------
    getRowIcon() {
      if (_.isFunction(this.iconBy)) {
        return it => this.iconBy(it)
      }
      if (_.isString(this.iconBy)) {
        return it => _.get(it, this.iconBy)
      }
      return it => null
    },
    //--------------------------------------
    isShowHead() {
      return /^(frozen|normal)$/.test(this.head)
    },
    //--------------------------------------
    HeadCheckerIcon() {
      if (this.isAllChecked) {
        return "fas-check-square"
      }
      if (this.hasChecked) {
        return "fas-minus-square"
      }
      return "far-square"
    },
    //--------------------------------------
    VirtualRowStyle() {
      return {
        height: `${this.virtualRowHeight}px`
      }
    },
    //--------------------------------------
    VirtualRows() {
      if (this.rowsRenderedAt > 0) {
        if (this.virtualPageCount > 0) {
          let I0 = this.RowScopeFrom
          let I1 = this.RowScopeTo
          return this.tblRows.slice(I0, I1)
        }
        return this.tblRows.slice(0)
      }
    },
    //--------------------------------------
    hasVirtualRowHead() {
      return this.virtualPageCount > 0
        && this.virtualScopeBegin > 0
    },
    //--------------------------------------
    hasVirtualRowTail() {
      return this.virtualPageCount > 0
        && this.virtualScopeEnd > 0
        && this.virtualScopeEnd < this.data.length
    },
    //--------------------------------------
    VirtualRowHeadStyle() {
      return {
        height: `${this.virtualRowHeight * this.virtualScopeBegin}px`
      }
    },//--------------------------------------
    VirtualRowTailStyle() {
      let N = this.tblRows.length
      return {
        height: `${this.virtualRowHeight * (N - this.virtualScopeEnd)}px`
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnClickHeadChecker() {
      // Cancel All
      if (this.isAllChecked) {
        this.cancelRow()
      }
      // Check All
      else {
        this.checkRow()
      }
    },
    //--------------------------------------
    OnClickTop($event) {
      if (this.cancelable) {
        // Click The body or top to cancel the row selection
        if (Ti.Dom.hasOneClass($event.target,
          'ti-table', 'table-body',
          'table-head-cell',
          'table-head-cell-text')) {
          this.cancelRow()
        }
      }
    },
    //--------------------------------------
    OnClickRowIcon(row, $event) {
      this.$notify("icon", {
        rowId: row.id,
        shift: $event.shiftKey,
        toggle: ($event.ctrlKey || $event.metaKey)
      })
    },
    //--------------------------------------
    OnClickQuickLabelCopy({ text } = {}, $event) {
      let $l = Ti.Dom.closest($event.srcElement, ".ti-label")
      Ti.Be.BlinkIt($l)
      Ti.Be.writeToClipboard(text)
    },
    //--------------------------------------
    OnClickChecker(row, $event) {
      if (this.checkable) {
        this.OnRowCheckerClick({
          rowId: row.id,
          shift: $event.shiftKey,
          toggle: ($event.ctrlKey || $event.metaKey)
        })
      }
    },
    //--------------------------------------
    OnClickRow(row, $event = {}) {
      this.LOG("OnClickRow", row.id)
      let toggle = ($event.ctrlKey || $event.metaKey)
      if (this.selectable && (!row.current || toggle)) {
        this.OnRowSelect({
          rowId: row.id,
          shift: $event.shiftKey,
          toggle
        })
      }
    },
    //-----------------------------------------------
    OnDblClickRow(row, $event = {}) {
      if (this.openable) {
        $event.stopPropagation()
        if (this.notifyOpenName) {
          this.$notify(this.notifyOpenName, row)
        }
        if (_.isFunction(this.onOpen)) {
          this.onOpen(row)
        }
      }
    },
    //-----------------------------------------------
    OnCellItemChanged(row, cell, item, payload) {
      this.$notify("cell:item:change", {
        rowId: row.id,
        rowData: row.rowData,
        cellIndex: cell.index,
        index: row.index,
        name: item.key,
        value: payload
      })
    },
    //--------------------------------------
    tryCheckedIds(newVal, oldVal) {
      _.delay(() => {
        if (!_.isEqual(newVal, oldVal)) {
          this.LOG("tryCheckedIds", { newVal, oldVal })
          let ids = {}
          _.forEach(newVal, (_, k) => {
            ids[k] = true
          })
          _.forEach(oldVal, (_, k) => {
            ids[k] = true
          })
          this.reEvalRows(ids)
        }
      })
    },
    //--------------------------------------
    evalRenderScope() {
      if (this.enableScope && this.virtualRowHeight > 0 && this.myTableRect) {
        let vH = this.myTableRect.height
        let rH = this.virtualRowHeight
        this.LOG("evalRenderScope-begin", vH, rH)
        let vpc = Math.round(vH / rH)
        let halfVpc = Math.round(vpc / 2)
        this.virtualPageCount = vpc
        if (vpc > 0) {
          // Find the active row 
          let arI = this.findRowIndexById(this.theCurrentId)
          arI = Math.max(arI, 0)

          let scope = []
          // Out of the  first screen
          if (arI > vpc) {
            scope[0] = arI - vpc
            scope[1] = arI + vpc
          }
          // In the first screen
          else {
            scope[0] = 0
            scope[1] = vpc + halfVpc
          }
          scope[0] = Math.max(0, scope[0])
          scope[1] = Math.min(scope[1], this.data.length)
          this.virtualScopeBegin = scope[0]
          this.virtualScopeEnd = scope[1]
          this.LOG("evalRenderScope-end", { vH, rH, vpc, arI, scope: scope.join(":") })
        } else {
          this.virtualScopeBegin = 0
          this.virtualScopeEnd = 0
          this.LOG("evalRenderScope-end(B)", { vH, rH, vpc, scope: "0:0" })
        }

      }
      // Render all
      else {
        this.virtualScopeBegin = 0
        this.virtualScopeEnd = -1
        this.LOG("evalRenderScope-end(C)", { scope: "0:-1" })
      }
    },
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      //this.LOG("ti-table", uniqKey)
      if ("ARROWUP" == uniqKey) {
        this.selectPrevRow({
          payload: { byKeyboardArrow: true }
        })
        this.scrollCurrentIntoView()
        return { prevent: true, stop: true, quit: true }
      }

      if ("ARROWDOWN" == uniqKey) {
        this.selectNextRow({
          payload: { byKeyboardArrow: true }
        })
        this.scrollCurrentIntoView()
        return { prevent: true, stop: true, quit: true }
      }
    },
    //--------------------------------------
    OnScroll($event) {
      let N = this.data.length
      if (N <= 0 || !this.myTableRect) {
        return
      }
      let vH = this.myTableRect.height
      let sT = this.$el.scrollTop
      let sH = this.$el.scrollHeight
      let r0H = this.virtualRowHeight
      let r1H = Math.ceil(sH / N)
      let vpc = this.virtualPageCount
      let vs0 = this.RowScopeFrom
      let vs1 = this.RowScopeTo


      let halfVpc = Math.round(this.virtualPageCount / 2)

      let I0 = parseInt(sT / r0H) - halfVpc
      let vBegin = Math.max(0, Math.min(vs0, I0))

      let I1 = parseInt((sT + vH) / r1H) + vpc
      let vEnd = Math.min(N, Math.max(vs1, I1))
      if (vEnd < 0) {
        vEnd = N
      }


      this.LOG({
        sT, sH,
        // E1: `${sT} / ${r1H}`,
        // vs: JSON.stringify([vs0, vs1]),
        // I: JSON.stringify([I0, I1]),
        s: JSON.stringify([vBegin, vEnd])
      })
      this.virtualScopeBegin = vBegin
      this.virtualScopeEnd = vEnd
      this.evalTableRows()
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  watch: {
    "data": function (newVal, oldVal) {
      this.evalRenderScope();
      this.evalListDataWhenMarkChanged(newVal, oldVal)
    },
    //"TableFields": "evalListDataWhenMarkChanged", //<= it will cause evalListData always
    "selectable": "evalListDataWhenMarkChanged",
    "checkable": "evalListDataWhenMarkChanged",
    "hoverable": "evalListDataWhenMarkChanged",
    "filterValue": "evalListDataWhenMarkChanged",
    "checkedIds": "tryCheckedIds",
  },
  ///////////////////////////////////////////////////
  created: function () {
    this.LOG = () => { }
    //this.LOG = console.log
  },
  ///////////////////////////////////////////////////
  mounted: async function () {
    // Measure self
    this.myTableRect = Ti.Rects.createBy(this.$el)

    Ti.Viewport.watch(this, {
      resize: _.debounce(() => this.OnResize(), 10),
    })
    this.debounceScroll = _.throttle(($event) => {
      this.OnScroll($event)
    }, 200)
    this.$el.addEventListener('scroll', this.debounceScroll)



    // Restore columns setting
    this.restoreLocalSettings()
    this.setupAllFields(this.fields)
    this.updateMyFieldsByKey(this.myShownFieldKeys)

    await this.evalListData()

    // render scope, it need the data for find index
    this.evalRenderScope();

    // Eval the table viewport Rect, it need scope
    await this.__eval_row_after_data()
  },
  ///////////////////////////////////////////////////
  beforeDestroy: function () {
    this.$el.removeEventListener('scroll', this.debounceScroll)
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////////////////////
}
export default _M;