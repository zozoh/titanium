export default {
  ///////////////////////////////////////////////////
  data: () => ({
    tblRows: [/*
      {
        __processed: true,   // had been evalTableRows
        groupTitleComs:[{comType,comConf}],
      }
      {
        __processed: true,   // had been evalTableRows
        className.is-current is-checked
        id,index
        icon,indent,
        displayIndex,asGroupTitle,
        checkable,selectable,openable,cancelable,hoverable,
        rawData,item,
        cells:[{
          index,
          displayItems:[{comType,comConf}]
        }]
      }
    */],
    myData: []
  }),
  ///////////////////////////////////////////////////
  computed: {
    //--------------------------------------
    TheData() {
      return this.tblRows;
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  methods: {
    //--------------------------------------
    async genDisplays(it = {}, display = [], opt = {}) {
      //this.LOG("genDisplays", it, display)
      let { id, index } = it
      let list = []
      if (!_.isEmpty(display)) {
        for (let i = 0; i < display.length; i++) {
          let disIt = await this.evalDataForFieldDisplayItem({
            itemData: it.rawData,
            displayItem: display[i],
            vars: {
              rowId: id
            },
            ...opt,
            uniqKey: `row${id}-cell${index}-${i}`
          })
          if (disIt) {
            disIt.className = `item-${i}`
            // 判断是否可以快速渲染不用真的弄个真控件
            // 如果就是最朴素的 Label 
            let { comType, comConf = {} } = disIt
            if (/^(TiLabel|ti-label)$/.test(comType)) {
              let {
                style,
                className, hoverCopy, value,
                newTab, href, dict, format,
                placeholder, autoLoadDictIcon, prefixIcon,
                editable
              } = comConf
              if (!editable) {
                let text = value
                let icon = prefixIcon;
                if (Ti.Util.isNil(text) || (_.isString(text) && !text)) {
                  text = Ti.Util.fallback(placeholder, "i18n:blank")
                }
                else if (dict) {
                  if (Ti.Util.isNil(autoLoadDictIcon)) {
                    autoLoadDictIcon = Ti.Config.getComProp(
                      "TiLabel", "autoLoadDictIcon", true)
                  }
                  let $d = Ti.DictFactory.CheckDict(dict)
                  text = await $d.getItemText(value)
                  if (autoLoadDictIcon) {
                    icon = await $d.getItemIcon(value)
                  }
                }
                if (format) {
                  if (_.isFunction(format)) {
                    text = format(text)
                  }
                }

                if (/^i18n:/.test(text)) {
                  text = Ti.I18n.text(text)
                }
                disIt.quickLabel = {
                  style,
                  className: Ti.Css.mergeClassName(className, disIt.className, {
                    "is-hover-copy": hoverCopy
                  }),
                  hoverCopy,
                  newTab, href,
                  target: newTab ? "_blank" : undefined,
                  text
                }
                if (icon) {
                  disIt.quickLabel.iconHtml = Ti.Icons.fontIconHtml(icon)
                }
              }
            }
            else if (/^(TiIcon|ti-icon)$/.test(comType)) {
              let { value, className } = comConf
              let icon = Ti.Icons.parseFontIcon(value)
              if (icon && icon.className) {
                disIt.quickIcon = {
                  className: Ti.Css.mergeClassName(className, disIt.className),
                  iconClass: icon.className
                }
              }
            }
            list.push(disIt)
          }

        }
        return list;
      }
    },
    //--------------------------------------
    async genTableCells(it = {}) {
      let cells = []
      for (let i = 0; i < this.TableFields.length; i++) {
        let fld = this.TableFields[i]
        let hasAlign = fld.className && fld.className.indexOf("align-") >= 0;
        let cell = _.cloneDeep(fld);
        cell.index = i
        cell.className = Ti.Css.mergeClassName(cell.className, {
          "has-align": hasAlign,
          "not-align": !hasAlign
        })
        cell.WrapperClass = {
          "is-nowrap": fld.nowrap,
        }
        cell.displayItems = await this.genDisplays(it, fld.display)
        cells.push(cell)
      }
      return cells
    },
    //--------------------------------------
    async evalOneTableRow(rows, index, count = {}) {
      let it = rows[index]

      // Alreay prcessed
      if (it.__processed) {
        return
      }

      // Out of scope
      let VI0 = this.RowScopeFrom
      let VI1 = this.RowScopeTo
      if (index < VI0 || index >= VI1) {
        return
      }

      // check group row
      if (it.asGroupTitle) {
        it.groupTitleComs = await this.genDisplays(it, this.RowGroupTitleDisplay, {
          autoIgnoreNil: false,
          autoIgnoreBlank: false
        });
      }
      // tidy rowNumber
      else if (_.isNumber(this.rowNumberBase)) {
        it.hasRowNumber = true;
        let rn = this.rowNumberBase + it.displayIndex
        if (this.rowNumberWidth > 1) {
          rn = _.padStart(rn, this.rowNumberWidth, '0');
        }
        it.RowNumber = rn
      }
      //
      // Generate each cells
      it.cells = await this.genTableCells(it)

      //
      // Update status
      this.evalOneRowStatus(it)
      it.__processed = true
      count.N++
    },
    //--------------------------------------
    async evalTableRows() {
      this.LOG("evalTableRows begin")
      let rows = this.tblRows
      let promiseLoadRows = []
      let count = { N: 0 }
      for (let i = 0; i < rows.length; i++) {
        promiseLoadRows.push(this.evalOneTableRow(rows, i, count))
      }
      await Promise.all(promiseLoadRows)
      if (count.N > 0) {
        this.rowsRenderedAt = Date.now()
      }
      this.LOG("evalTableRows end")
    },
    //--------------------------------------
    evalOneRowStatus(row, {
      currentId = this.theCurrentId,
      checkedIds = this.theCheckedIds
    } = {}) {
      //this.LOG("evalOneRowStatus")
      if (!row) {
        return
      }
      row.current = (row.id == currentId)
      row.checked = checkedIds[row.id] ? true : false
      row.checkerIcon = row.checked
        ? this.checkIcons.on
        : this.checkIcons.off;
      row.disClassName = Ti.Css.mergeClassName(row.className, {
        "is-current": row.current,
        "is-checked": row.checked,
        "no-checked": !row.checked
      })
    },
    //--------------------------------------
    async evalListData() {
      if (_.isElement(this.$el)) {
        this.$el.scrollTop = 0
      }
      //let beginMs = Date.now()
      this.LOG("1. evalListData begin")
      let list = await this.evalData((it) => {
        it.icon = this.getRowIcon(it.item)
        if (it.icon) {
          let ico = Ti.Icons.parseFontIcon(it.icon)
          if (ico) {
            it.iconClass = ico.className
          }
        }
        it.showIcon = it.icon && _.isString(it.icon)
        it.indent = this.getRowIndent(it.item)
      })
      this.tblRows = list
      this.LOG("2. evalListData end")

      // this.evalMyRows();
      // this.LOG("4. evalMyRows end")
      // let du = Date.now() - beginMs
      // this.LOG("evalListData in", `${du}ms`)
      // Scroll into view
    },
    //--------------------------------------
    async __eval_row_after_data() {
      this.LOG("__eval_row_after_data: evalTableRows")
      await this.evalTableRows()

      this.LOG("__eval_row_after_data: wait for scroll")
      _.delay(() => {
        this.scrollCurrentIntoView()
      }, 0)
      // make sure it scrolled, maybe dom render so long ..
      // _.delay(() => {
      //   this.scrollCurrentIntoView()
      // }, 300)
    },
    //--------------------------------------
    async reEvalRows(ids = {}, { currentId, checkedIds } = {}) {
      let indexes = []
      _.forEach(this.tblRows, it => {
        if (ids[it.id]) {
          indexes.push(it.index)
        }
      })

      this.LOG("reEvalRows", { currentId, checkedIds })
      this.LOG("reEvalRows - theCurrentId", this.theCurrentId)
      this.LOG("reEvalRows - myCurrentId", this.myCurrentId)
      this.LOG("reEvalRows - currentId", this.currentId)
      this.LOG("reEvalRows - theCheckedIds", this.theCheckedIds)
      this.LOG("reEvalRows - myCheckedIds", this.myCheckedIds)
      this.LOG("reEvalRows - checkedIds", this.checkedIds)
      //let rows = _.cloneDeep(this.myRows)
      //this.LOG("cloned")
      for (let i of indexes) {
        let row = this.tblRows[i]
        this.evalOneRowStatus(row, { currentId, checkedIds })
        this.$set(this.tblRows, i, row)
        this.LOG("evalOneRowStatus", i)
      }
      this.LOG("reEvalRows done")

      _.delay(() => {
        this.scrollCurrentIntoView()
      }, 100)
    },
    //--------------------------------------
    // 采用这个，是为了绕开 VUe 的监听机制能快点得到响应
    // 因为渲染数据的时间是在省不了
    __handle_select({ currentId, checkedIds, oldCurrentId, oldCheckedIds }) {
      this.LOG("__handle_select", currentId, checkedIds)
      let ids = _.assign({}, oldCheckedIds, checkedIds)
      if (currentId) {
        ids[currentId] = true
      }
      if (oldCurrentId) {
        ids[oldCurrentId] = true
      }
      this.reEvalRows(ids, { currentId, checkedIds })
    }
    //--------------------------------------
  }
  ///////////////////////////////////////////////////F
}