const _M = {
  ///////////////////////////////////////////////////
  data: () => ({
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
      let ids = _.assign({}, newVal, oldVal)
      this.reEvalRows(ids)
    },
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-table", uniqKey)
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
  },
  ///////////////////////////////////////////////////
  watch: {
    "data":  "evalListDataWhenMarkChanged",
    "fields": {
      handler: function (newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          this.restoreLocalSettings()
          this.setupAllFields(newVal)
          this.updateMyFieldsByKey(this.myShownFieldKeys)
        }
      },
      immediate: true
    },
    "TableFields": "evalListDataWhenMarkChanged",
    "selectable": "evalListDataWhenMarkChanged",
    "checkable": "evalListDataWhenMarkChanged",
    "hoverable": "evalListDataWhenMarkChanged",
    "filterValue": "evalListDataWhenMarkChanged",
    "checkedIds": "tryCheckedIds",
  },
  ///////////////////////////////////////////////////
  mounted: async function () {
    Ti.Viewport.watch(this, {
      resize: _.debounce(() => this.OnResize(), 10)
    })
    this.$nextTick(() => this.OnResize())
    
    // Eval the table viewport Rect
    this.myTableRect = Ti.Rects.createBy(this.$el)
    await this.evalListData()

    if (this.autoScrollIntoView) {
      _.delay(() => {
        this.scrollCurrentIntoView()
      }, 0)
    }
  },
  ///////////////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////////////////////
}
export default _M;