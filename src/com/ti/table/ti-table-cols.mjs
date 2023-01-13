export default {
  ///////////////////////////////////////////////////
  data: () => ({
    //myFieldKeys: undefined,
    myFieldWidths: undefined,

    allFields: [],
    myShownFieldKeys: [],
    myFields: [],
    myTableRect: null
  }),
  ///////////////////////////////////////////////////
  computed: {
    //--------------------------------------
    TableFields() {
      if (!this.myTableRect) {
        return []
      }
      let fields = []
      let lastI = this.myFields.length - 1
      for (let i = 0; i < this.myFields.length; i++) {
        let fld = this.myFields[i]
        //..................................
        if (_.isBoolean(fld.visible) && !fld.visible) {
          continue
        }
        if (_.isBoolean(fld.hidden) && fld.hidden) {
          continue
        }
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
    OnResize() {
      if (_.isElement(this.$el)) {
        this.myTableRect = Ti.Rects.createBy(this.$el)
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
    async OnCustomizeFields() {
      // Found all avaliable fields
      let cans = _.map(this.allFields, ({ title, key }) => {
        return { text: title, value: key }
      })
      let vals = _.map(this.myFields, fld => fld.key)

      // Show the dialog
      let reo = await Ti.App.Open({
        title: "i18n:choose-fields",
        width: "6.4rem",
        height: "90%",
        position: "top",
        actions: [
          {
            text: "i18n:ok",
            handler: ({ result }) => result
          },
          {
            icon: "fas-history",
            text: "i18n:reset",
            handler: () => []
          },
          {
            text: "i18n:cancel"
          }
        ],
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
        //this.myFieldKeys = reo
        let cuo = Ti.Storage.local.getObject(this.keepCustomizedTo)
        cuo.shownFieldKeys = reo
        // Clear to reset width at same time
        if (_.isEmpty(reo)) {
          cuo.setFieldsWidth = []
        }
        Ti.Storage.local.setObject(this.keepCustomizedTo, cuo)
      }

      // Update the new field key
      this.updateMyFieldsByKey(reo)
      if (_.isEmpty(reo)) {
        this.myFieldWidths = []
      }

      await this.evalListData()
      await this.evalTableRows()
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
      // this.LOG({
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
    scrollCurrentIntoView() {
      this.LOG("scrollCurrentIntoView", this.myLastIndex, this.theCurrentId)
      if (this.autoScrollIntoView && this.theCurrentId) {
        let $view = this.$el
        let $row = Ti.Dom.find(`.table-row[row-id="${this.theCurrentId}"]`, $view)
        this.LOG("find row", $row)
        if (!_.isElement($view) || !_.isElement($row)) {
          return
        }

        let r_view = Ti.Rects.createBy($view)
        let r_row = Ti.Rects.createBy($row)

        // test it need to scroll or not
        if (!r_view.contains(r_row)) {
          // at bottom
          if (r_row.bottom > r_view.bottom) {
            this.LOG("at bottom", r_row.bottom - r_view.bottom)
            $view.scrollTop += r_row.bottom - r_view.bottom + r_view.height / 2
          }
          // at top
          else {
            $view.scrollTop += r_row.top - r_view.top
            this.LOG("at top", r_row.top - r_view.top)
          }
        }
      }
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
      this.myFields = _.without(list, undefined, null)
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
  ///////////////////////////////////////////////////F
}