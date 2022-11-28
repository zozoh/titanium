export default {
  ///////////////////////////////////////////////////
  data: () => ({
    tblRows: [/*
      {
        groupTitleComs:[{comType,comConf}]
      }
      {
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
    myRows: [/*
      add className.is-current is-checked for each row of tabRows
    */],
    myData: []
  }),
  ///////////////////////////////////////////////////
  computed: {
    //--------------------------------------
    TheData() {
      return this.myData;
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////////////
  methods: {
    //--------------------------------------
    async genDisplays(it = {}, display = [], opt = {}) {
      //console.log("genDisplays", it, display)
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
              let { className, hoverCopy, value, newTab, href, dict } = comConf
              if (false === hoverCopy || _.isUndefined(hoverCopy)) {
                let text = value
                if (dict) {
                  let $d = Ti.DictFactory.CheckDict(dict)
                  text = await $d.getItemText(value)
                }
                if(/^i18n:/.test(text)){
                  text = Ti.I18n.text(text)
                }
                disIt.quickLabel = {
                  className: Ti.Css.mergeClassName(className, disIt.className),
                  newTab, href,
                  target: newTab ? "_blank" : undefined,
                  text
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
    async evalOneTableRow(rows, index, it) {
      if (it.asGroupTitle) {
        it.groupTitleComs = await this.genDisplays(it, this.RowGroupTitleDisplay, {
          autoIgnoreNil: false,
          autoIgnoreBlank: false
        });
      } else if (_.isNumber(this.rowNumberBase)) {
        it.hasRowNumber = true;
        let rn = this.rowNumberBase + it.displayIndex
        if (this.rowNumberWidth > 1) {
          rn = _.padStart(rn, this.rowNumberWidth, '0');
        }
        it.RowNumber = rn
      }
      it.cells = await this.genTableCells(it)
      rows[index] = it
    },
    //--------------------------------------
    async evalTableRows(list = []) {
      let rows = []
      let loadRows = []
      for (let i = 0; i < list.length; i++) {
        var it = list[i];
        loadRows.push(this.evalOneTableRow(rows, i, it))
      }
      await Promise.all(loadRows)
      this.tblRows = rows
    },
    //--------------------------------------
    evalOneMyRow(rows = [], index, {
      currentId = this.theCurrentId,
      checkedIds = this.theCheckedIds
    } = {}) {
      let it = rows[index]
      if(!it){
        return
      }
      it.current = (it.id == currentId)
      it.checked = checkedIds[it.id] ? true : false
      it.checkerIcon = it.checked
        ? this.checkIcons.on
        : this.checkIcons.off;
      it.disClassName = Ti.Css.mergeClassName(it.className, {
        "is-current": it.current,
        "is-checked": it.checked,
        "no-checked": !it.checked
      })
    },
    //--------------------------------------
    evalMyRows(opt) {
      let rows = _.cloneDeep(this.tblRows)
      //console.log("after clone")
      for (let i = 0; i < rows.length; i++) {
        this.evalOneMyRow(rows, i, opt)
      }
      this.myRows = rows
    },
    //--------------------------------------
    async evalListData() {
      let beginMs = Date.now()
      let list = await this.evalData((it) => {
        it.icon = this.getRowIcon(it.item)
        if(it.icon){
          let ico = Ti.Icons.parseFontIcon(it.icon)
          if(ico){
            it.iconClass = ico.className
          }
        }
        it.showIcon = it.icon && _.isString(it.icon)
        it.indent = this.getRowIndent(it.item)
      })
      this.myData = list
      await this.evalTableRows(list);

      this.evalMyRows();
      let du = Date.now() - beginMs
      //console.log("evalListData in", `${du}ms`)
      //let du = Date.now() - ms
      //console.log("evalListData", `${du}ms`)
      // Scroll into view
      _.delay(() => {
        this.scrollCurrentIntoView()
      }, 300)
    },
    //--------------------------------------
    async reEvalRows(ids = {}, { currentId, checkedIds } = {}) {
      let indexes = []
      _.forEach(this.myData, it => {
        if (ids[it.id]) {
          indexes.push(it.index)
        }
      })

      //console.log("theCurrentId ...")
      let rows = _.cloneDeep(this.myRows)
      //console.log("cloned")
      for (let i of indexes) {
        this.evalOneMyRow(rows, i, { currentId, checkedIds })
        //console.log("evalOneMyRow", i)
      }
      this.myRows = rows
      //console.log("after evalMyRows")
    },
    //--------------------------------------
    // 采用这个，是为了绕开 VUe 的监听机制能快点得到响应
    // 因为渲染数据的时间是在省不了
    __handle_select({ currentId, checkedIds, oldCurrentId, oldCheckedIds }) {
      //console.log("__handle_select", currentId, checkedIds)
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
  },
  ///////////////////////////////////////////////////
  watch: {
    "data": "evalListDataWhenMarkChanged",
    "TableFields": "evalListDataWhenMarkChanged",
    "selectable": "evalListDataWhenMarkChanged",
    "checkable": "evalListDataWhenMarkChanged",
    "hoverable": "evalListDataWhenMarkChanged",
    "filterValue": "evalListDataWhenMarkChanged"
  },
  ///////////////////////////////////////////////////F
}