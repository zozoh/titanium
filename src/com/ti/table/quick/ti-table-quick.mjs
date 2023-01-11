const _M = {
  ///////////////////////////////////////////////////
  data: () => ({
    myLastIndex: -1,      // The last row index selected by user
    myCurrentId: null,    // Current row ID
    myCheckedIds: {}      // Which row has been checked
  }),
  ///////////////////////////////////////////////////
  // props -> ti-table-props.mjs
  ///////////////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-checkable": this.checkable,
        "is-selectable": this.selectable,
        "is-openable": this.openable,
        "is-cancelable": this.cancelable,
        "is-hoverable": this.hoverable
      }, [
        `is-border-${this.border}`
      ])
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    },
    //--------------------------------------
    /*
    [{
      index, id, className,
      cells : [{
          index, width, nowrap, className,
          checked, changed, current,
          items : [{
            index, type,
            className,    // <- getClassName
            value,        // <- getValue
            displayValue  // <- transformer | tidy
          }]
      }]
    }]
    */
    TableData() {
      let showNumber = _.isNumber(this.rowNumberBase)
      let base = showNumber ? this.rowNumberBase : -1
      let list = _.map(this.data, (obj, index) => {
        let id = this.getRowId(obj, index)
        if (Ti.Util.isNil(id)) {
          id = `Row-${index}`
        }
        let checked = !!this.myCheckedIds[id]
        let changed = (this.changedId == id)
        let current = (this.myCurrentId == id)
        let className = {
          "is-checked": checked,
          "is-current": current,
          "is-changed": changed
        }

        let number;
        if (base >= 0) {
          number = base + index
        }

        let cells = _.map(this.TableFields, fld => {
          let items = _.map(fld.display, ({
            index, type, getClassName, getValue,
            transform, tidy
          }) => {
            let it = { index, type }
            // Item value
            it.value = getValue(obj)
            // ClassName
            if (getClassName) {
              it.className = getClassName(it.value)
            }
            // Transform
            let disval = it.value
            if (transform) {
              disval = transform(disval)
            }
            disval = tidy(disval)
            // Tidy value by types
            it.displayValue = disval
            // Done for item
            return it
          }) // End Items

          return { ...fld, items }
        }) // End cells

        return {
          showNumber,
          number, index,
          id, className, cells,
          checked, changed, current,
          rawData: obj
        }
      })

      return list
    },
    //-----------------------------------------------
    getRowId() {
      return Ti.Util.genRowIdGetter(this.idBy)
    },
    //-----------------------------------------------
    isDataEmpty() {
      return !_.isArray(this.TableData) || _.isEmpty(this.TableData)
    },
    //-----------------------------------------------
    isAllChecked() {
      // Empty list, nothing checked
      if (this.isDataEmpty) {
        return false
      }
      if (_.size(this.myCheckedIds) != _.size(this.TableData)) {
        return false
      }
      // Checking ...
      for (let row of this.TableData) {
        if (!this.myCheckedIds[row.id])
          return false;
      }
      return true
    },
    //-----------------------------------------------
    hasChecked() {
      return !_.isEmpty(this.myCheckedIds)
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
      //....................................
      const evalQuickStrDisplay = (str) => {
        //  key.className
        let m = /^([\w\d_-]+)((\.|::)([\w\d\s_-]+))?/.exec(str)
        if (m) {
          return {
            key: m[1],
            className: m[4]
          }
        }
        // <icon:fas-xxx>?
        m = /^<([^:>=]*)(:([^>:]+))?(:([^>:]+))?>(\?)?$/.exec(str)
        if (m) {
          return {
            type: "icon",
            key: m[1],
            defaultAs: m[3],
            className: m[5],
            ignoreNil: "?" == m[6]
          }
        }
        // Default
        return { key: str }
      }
      //....................................
      const evalFldDisplay = (dis = {}, index) => {
        // Quick string mode
        if (_.isString(dis)) {
          dis = evalQuickStrDisplay(dis)
        }
        let { key, type, className, transformer, defaultAs, ignoreNil } = dis

        // Default type as text
        type = type || "text"

        // Get value
        let getValue;
        if (".." == key) {
          getValue = obj => obj
        } else if (_.isArray(key)) {
          getValue = obj => _.pick(obj, key)
        } else {
          getValue = obj => _.get(obj, key)
        }

        // ClassName
        let getClassName;
        if (_.isFunction(className)) {
          getClassName = className
        } else if (_.isString(className)) {
          getClassName = () => className
        } else if (className) {
          let cans = []
          _.forEach(className, (key, val) => {
            cans.push({
              className: key,
              match: Ti.AutoMatch.parse(val)
            })
          })
          getClassName = (val) => {
            for (let can of cans) {
              if (can.match(val))
                return can.className
            }
          }
        }

        // transformer
        let transFunc;
        if (transformer) {
          transFunc = Ti.Util.genInvoking(transformer, {
            context: this,
            partial: "right"
          })
        }

        // Tidy Value by type
        let tidyFunc = ({
          "text": v => v,
          "icon": v => Ti.Icons.parseFontIcon(v),
          "img": v => v
        })[type]

        if (!tidyFunc) {
          throw "Invalid display type: " + type
        }

        return {
          index, type,
          getClassName,
          getValue,
          transform: transFunc,
          tidy: tidyFunc,
          defaultAs, ignoreNil
        }
      }
      //....................................
      let lastI = this.fields.length - 1
      let fields = _.map(this.fields, (fld, index) => {
        let diss = [].concat(fld.display)
        let display = _.map(diss, (dis, index) => {
          return evalFldDisplay(dis, index)
        })
        return {
          ...fld,
          headStyle: Ti.Css.toStyle({
            width: fld.width
          }),
          index, display,
          isFirst: 0 == index,
          isLast: lastI == index,
          className: {
            "is-nowrap": fld.nowrap
          }
        }
      })
      //....................................
      return fields
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  methods: {
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
    // Publish methods
    //--------------------------------------
    findRowIndexById(rowId) {
      for (let row of this.TableData) {
        if (row.id == rowId) {
          return row.index
        }
      }
      return -1
    },
    //--------------------------------------
    findRowById(rowId) {
      for (let row of this.TableData) {
        if (row.id == rowId) {
          return row
        }
      }
    },
    //--------------------------------------
    getRow(index = 0) {
      return _.nth(this.TableData, index)
    },
    getCurrentRow(currentId = this.myCurrentId) {
      return this.findRowById(currentId)
    },
    //--------------------------------------
    removeCheckedRow(idMap = this.myCheckedIds) {
      let checkedIds = this.getCheckedIdsMap(idMap, false)
      let minIndex = -1
      let maxIndex = -1
      let remainsRows = []
      let checkedRows = []

      _.forEach(this.TableData, row => {
        if (idMap[row.id]) {
          minIndex = minIndex < 0
            ? row.index
            : Math.min(row.index, minIndex);

          maxIndex = maxIndex < 0
            ? row.index
            : Math.max(row.index, maxIndex);

          checkedRows.push(row)
        } else {
          remainsRows.push(row)
        }
      })

      return {
        remainsRows, checkedRows, minIndex, maxIndex, checkedIds
      }
    },
    //-----------------------------------------------
    removeChecked(idMap = this.myCheckedIds) {
      let re = this.removeCheckedRow(idMap)
      re.remains = _.map(re.remainsRows, row => row.rawData)
      re.checked = _.map(re.checkedRows, row => row.rawData)
      return re
    },
    //-----------------------------------------------
    moveCheckedRow(offset = 0, idMap = this.myCheckedIds) {
      idMap = this.getCheckedIdsMap(idMap, false)
      //this.LOG(idMap)
      if (offset == 0 || _.isEmpty(idMap))
        return { rows: this.TheData, nextCheckedIds: idMap }

      let {
        checkedIds,
        minIndex,
        maxIndex,
        remainsRows,
        checkedRows
      } = this.removeCheckedRow(idMap)

      // targetIndex in remains[] list
      let targetIndex = Math.max(0, minIndex - 1)
      if (offset > 0) {
        targetIndex = Math.min(maxIndex - checkedRows.length + 2, remainsRows.length)
      }
      // Insert
      let rows = _.cloneDeep(remainsRows)
      rows.splice(targetIndex, 0, ...checkedRows)

      if (_.isEmpty(rows))
        return { rows: [], nextCheckedIds: {} }

      // If the index style ID, adjust them
      let nextCheckedIds = checkedIds
      if (/^Row-\d+$/.test(rows[0].id)) {
        nextCheckedIds = {}
        for (let i = 0; i < checkedRows.length; i++) {
          nextCheckedIds[`Row-${i + targetIndex}`] = true
        }
      }

      return { rows, nextCheckedIds }
    },
    //-----------------------------------------------
    moveChecked(offset = 0, idMap = this.myCheckedIds) {
      let re = this.moveCheckedRow(offset, idMap)
      re.list = _.map(re.rows, row => row.rawData)
      return re
    },
    //-----------------------------------------------
    getCheckedIdsMap(idList = [], autoCheckCurrent = this.autoCheckCurrent) {
      let idMap = {}
      // ID List
      if (_.isArray(idList)) {
        _.forEach(idList, (rowId) => {
          idMap[rowId] = true
        })
      }
      // Map
      else {
        _.forEach(idList, (checked, rowId) => {
          if (checked) {
            idMap[rowId] = true
          }
        })
      }
      // Force to check current
      if (autoCheckCurrent && !Ti.Util.isNil(this.myCurrentId)) {
        idMap[this.myCurrentId] = true
      }
      return idMap
    },
    //--------------------------------------
    // Utility
    //--------------------------------------
    scrollCurrentIntoView() {
      //this.LOG("scrollCurrentIntoView", this.myLastIndex)
      if (this.autoScrollIntoView && this.myCurrentId) {
        let index = this.findRowIndexById(this.myCurrentId)
        //this.LOG("scroll", index)
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
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  watch: {
    "currentId": {
      handler: function (newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          this.myCurrentId = newVal
        }
      },
      immediate: true
    },
    "checkedIds": {
      handler: function (newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          this.myCheckedIds = newVal
        }
      },
      immediate: true
    }
  },
  ///////////////////////////////////////////////////
  mounted: function () {
    if (this.autoScrollIntoView) {
      _.delay(() => {
        this.scrollCurrentIntoView()
      }, 0)
    }
  }
  ///////////////////////////////////////////////////
}
export default _M;