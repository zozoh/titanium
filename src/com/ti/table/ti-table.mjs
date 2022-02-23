const _M = {
  ///////////////////////////////////////////////////
  provide: function () {
    return {
      "$table": this
    }
  },
  ///////////////////////////////////////////////////
  data: () => ({
    myFieldKeys: undefined,
    myFieldWidths: undefined,

    allFields: [],
    myFields: [],
    myTableRect: null,
    myData: []
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
    TheData() {
      return this.myData
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
    TableFields() {
      if (!this.myTableRect) {
        return
      }
      let fields = []
      let lastI = this.myFields.length - 1
      for (let i = 0; i < this.myFields.length; i++) {
        let fld = this.myFields[i]
        //..................................
        let display = this.evalFieldDisplay(fld.display, fld.name)
        //..................................
        let fldWidth = _.nth(this.myFieldWidths, i)
        fldWidth = Ti.Util.fallbackNil(fldWidth, fld.width, "stretch")
        //..................................
        if (_.isString(fldWidth)) {
          // Percent
          if (/^\d+(\.\d+)?%$/.test(fldWidth)) {
            fldWidth = fldWidth.substring(0, fldWidth.length - 1) / 100;
          }
          // Auto or stretch
          else if (!/^(auto|stretch)$/.test(fldWidth)) {
            fldWidth = "stretch"
          }
        }
        // Must be number
        else if (!_.isNumber(fldWidth)) {
          fldWidth = "stretch"
        }
        //..................................
        let cell = {
          index: i,
          isFirst: 0 == i,
          isLast: lastI == i,
          title: fld.title,
          nowrap: fld.nowrap,
          width: fldWidth,
          className: fld.className,
          //.....................
          name: fld.name,
          display,
          //.....................
          type: fld.type,
          comType: fld.comType,
          comConf: fld.comConf,
          transformer: fld.transformer,
          serializer: fld.serializer
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
    async OnCustomizeFields() {
      // Found all avaliable fields
      let cans = _.map(this.allFields, ({ title, key }) => {
        return { text: title, value: key }
      })
      let vals = _.map(this.myFields, fld => fld.key)

      // Show the dialog
      let reo = await Ti.App.Open({
        title: "Choose fields",
        width: "6.4rem",
        height: "90%",
        position: "top",
        result: vals,
        comType: "TiTransfer",
        comConf: {
          options: cans
        },
        components: [
          "@com:ti/transfer"
        ]
      })

      // User cancel
      if (!reo) {
        return
      }

      // Store to local
      if (this.keepCustomizedTo) {
        this.myFieldKeys = reo
        let cuo = Ti.Storage.local.getObject(this.keepCustomizedTo)
        cuo.shownFieldKeys = reo
        Ti.Storage.local.setObject(this.keepCustomizedTo, cuo)
      }

      // Update the new field key
      this.updateMyFieldsByKey(reo)
    },
    //--------------------------------------
    OnColumnResizeBegin(index) {
      // Get Each column width
      let vm = this;
      let $doc = this.$el.ownerDocument;
      let $ths = Ti.Dom.findAll("thead th", this.$refs.table)
      let colWidths = []
      for (let $th of $ths) {
        let w = $th.getBoundingClientRect().width
        colWidths.push(w)
      }
      let TW = _.sum(colWidths)
      //
      // Prepare the dragging context
      //
      let DRG = {
        // Sum the column width 
        viewWidth: TW,
        // Get a virtual rect (remove the scrollbar width)
        // so it should be TableRect + SUM(columnsWith)
        vRect: Ti.Rects.create(_.assign({}, this.myTableRect, {
          width: TW
        }, "tlwh")),
        // Get the current column left
        left: _.sum(colWidths.slice(0, index + 1))
      }
      //
      // evel the indic-bar rect
      //
      let R = 1.5
      DRG.moveLeft = DRG.left + DRG.vRect.left
      DRG.indicBarRect = Ti.Rects.create({
        top: DRG.vRect.top,
        left: DRG.moveLeft - R,
        width: R * 2,
        height: DRG.vRect.height
      })
      //
      // Create indicBar
      //
      DRG.$indic = Ti.Dom.createElement({
        $p: $doc.body,
        tagName: "DIV",
        className: "ti-table-resizing-indicbar",
        style: {
          zIndex: 99999999,
          ...DRG.indicBarRect.toCss()
        }
      })
      //
      // Update indicBar
      //
      DRG.updateIndicBar = function () {
        let mvL = this.moveLeft - R
        Ti.Dom.setStyleValue(this.$indic, "left", mvL)
      }
      // 
      // Mouse move 
      //
      const OnBodyMouseMove = function ({ clientX }) {
        let { left, right } = DRG.vRect
        DRG.moveLeft = _.clamp(clientX, left, right)
        DRG.updateIndicBar()
      }
      //
      // Rlease
      //
      const DeposAll = function () {
        $doc.removeEventListener("mousemove", OnBodyMouseMove, true)
        $doc.removeEventListener("mouseup", DeposAll, true)
        Ti.Dom.remove(DRG.$indic)
        // Is need to update fields width?
        let rL0 = Math.round(DRG.left)
        let rL1 = Math.round(DRG.moveLeft - DRG.vRect.left)
        if (Math.abs(rL0 - rL1) > R) {
          vm.updateColumnWidth({
            index, colWidths, left: rL1
          })
        }
      }
      //
      // Bind events
      //
      $doc.addEventListener("mousemove", OnBodyMouseMove, true)
      $doc.addEventListener("mouseup", DeposAll, true)
    },
    //--------------------------------------
    updateColumnWidth({ index, colWidths, left }) {
      let TW = _.sum(colWidths)
      // Get the ajacent columns
      let ajColsWs = colWidths.slice(index, index + 2)
      let ajLeft = _.sum(colWidths.slice(0, index))
      let ajSumW = _.sum(ajColsWs)
      // Aj-Columns with after resize
      let ajColsW2 = []
      ajColsW2[0] = _.clamp(left - ajLeft, 0, ajSumW)
      ajColsW2[1] = ajSumW - ajColsW2[0]

      // Merge together
      let colWs = _.concat(colWidths)
      colWs[index] = ajColsW2[0]
      colWs[index + 1] = ajColsW2[1]

      // Eval each coumns percent
      let sumW = _.sum(colWs)
      let colPs = _.map(colWs, w => w / sumW)
      // console.log({
      //   index,
      //   before: ajColsWs.join(", "),
      //   after: ajColsW2.join(", "),
      //   ps: colPs.join(", "),
      //   psum: _.sum(colPs)
      // })
      this.myFieldWidths = _.map(colPs, p => Ti.S.toPercent(p))
      // Persistance
      if (this.keepCustomizedTo) {
        let cuo = Ti.Storage.local.getObject(this.keepCustomizedTo)
        cuo.setFieldsWidth = this.myFieldWidths
        Ti.Storage.local.setObject(this.keepCustomizedTo, cuo)
      }
    },
    //--------------------------------------
    getHeadCellStyle(fld) {
      if (fld && !Ti.Util.isNil(fld.width)
        && this.myTableRect && this.myTableRect.width > 0) {
        // Copy width
        let width = fld.width

        // Number
        if (_.isNumber(width)) {
          // -100: it will conver to percent
          if (width < 0) {
            let per = Math.abs(width / this.myTableRect.width)
            width = Math.round(per * 100) + "%"
          }
          // 0-1: => Percent
          else if (width >= 0 && width < 1) {
            width = Math.round(width * 100) + "%"
          }
          // 100: => pixcel
          else {
            width = `${width}px`
          }
        }

        return { width }
      }
    },
    //--------------------------------------
    scrollCurrentIntoView() {
      //console.log("scrollCurrentIntoView", this.myLastIndex)
      if (this.autoScrollIntoView && this.theCurrentId) {
        let index = this.findRowIndexById(this.theCurrentId)
        //console.log("scroll", index)
        let $view = this.$el
        let $row = Ti.Dom.find(`.table-row:nth-child(${index + 1})`, $view)

        if (!_.isElement($view) || !_.isElement($row)) {
          return
        }

        let r_view = Ti.Rects.createBy($view)
        let r_row = Ti.Rects.createBy($row)

        // test it need to scroll or not
        if (!r_view.contains(r_row)) {
          // at bottom
          if (r_row.bottom > r_view.bottom) {
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
    async evalListData() {
      this.myData = await this.evalData((it) => {
        it.icon = this.getRowIcon(it.item)
        it.indent = this.getRowIndent(it.item)
      })
      // Check ready 
      if (_.isEmpty(this.data)) {
        this.$nextTick(() => {
          this.myCellsReady = true
        })
      }
      // Resize fields
      this.OnResize()
      // Scroll into view
      _.delay(() => {
        this.scrollCurrentIntoView()
      }, 300)
    },
    //--------------------------------------
    updateMyFieldsByKey(keys = []) {
      let list;
      // Empty to all fields
      if (_.isEmpty(keys)) {
        list = []
        _.forEach(this.allFields, fld => {
          if (!fld.candidate) {
            list.push(_.cloneDeep(fld))
          }
        })
      }
      // Pick fields
      else {
        // Make Map by all fields
        let fldMap = {}
        for (let fld of this.allFields) {
          fldMap[fld.key] = fld
        }
        // Load the field
        list = _.map(keys, k => _.cloneDeep(fldMap[k]))
      }
      // Merge first column display
      if (list.length > 0 && this.headDisplay) {
        list[0].display = _.concat(this.headDisplay, list[0].display)
      }
      // Up to data
      this.myFields = list
    },
    //--------------------------------------
    setupAllFields(fields = []) {
      let list = []
      _.forEach(fields, (fld, i) => {
        let f2 = _.cloneDeep(fld)
        f2.key = f2.key || `C${i}`
        list.push(f2)
      })
      this.allFields = list
    },
    //--------------------------------------
    restoreLocalSettings() {
      if (this.keepCustomizedTo) {
        let cuo = Ti.Storage.local.getObject(this.keepCustomizedTo) || {}
        this.myShownFieldKeys = cuo.shownFieldKeys
        this.myFieldWidths = cuo.setFieldsWidth
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  watch: {
    "data": {
      handler: "evalListDataWhenMarkChanged",
      immediate: true
    },
    "dict": {
      handler: "evalListDataWhenMarkChanged",
      immediate: true
    },
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
    "selectable": "evalListDataWhenMarkChanged",
    "checkable": "evalListDataWhenMarkChanged",
    "hoverable": "evalListDataWhenMarkChanged",
    "filterValue": "evalListDataWhenMarkChanged"
  },
  ///////////////////////////////////////////////////
  mounted: function () {
    Ti.Viewport.watch(this, {
      resize: _.debounce(() => this.OnResize(), 10)
    })
    this.$nextTick(() => this.OnResize())
    if (this.autoScrollIntoView) {
      _.delay(() => {
        this.scrollCurrentIntoView()
      }, 0)
    }
    // Eval the table viewport Rect
    this.myTableRect = Ti.Rects.createBy(this.$el)
  },
  ///////////////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////////////////////
}
export default _M;