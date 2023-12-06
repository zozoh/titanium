export default {
  ///////////////////////////////////////////////////////
  data: () => ({
    myNextRowAmount: 10,
    myMatrix: [],
    myActivedCellKey: null,
    myActivedCellComType: null,
    myActivedCellComConf: {}
  }),
  ///////////////////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "data": {
      type: Object,
      default: undefined
    },
    "dataWidth": {
      type: Number,
      default: 10
    },
    "dataHeight": {
      type: Number,
      default: 100
    },
    "vars": {
      type: Object,
      default: () => ({})
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "extension": {
      type: String,
      default: "rows",
      validator: (v) => /^(none|cols|rows|both)$/.test(v)
    },
    "columns": {
      type: Array,
      default: undefined
    },
    "cellComType": {
      type: String
    },
    "cellComConf": {
      type: Object,
      default: undefined
    },
    "cellReadonly": {
      type: Boolean,
      default: false
    },
    "cellChangeEventName": {
      type: String,
      default: "change:cell"
    },
    "rowChangEventeName": {
      type: String,
      default: "change:row"
    },
    "dataChangeEventName": {
      type: String,
      default: "change"
    },
    "removeRowEventName": {
      type: String,
      default: "remove:row"
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "indexWidth": {
      type: Number,
      default: 40
    },
    "defaultCellWidth": {
      type: Number,
      default: 120
    }
  },
  ///////////////////////////////////////////////////////
  computed: {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //---------------------------------------------------
    SheetData() {
      return _.isEmpty(this.data) ? {} : this.data;
    },
    //---------------------------------------------------
    isCanExtendCols() {
      return /^(cols|both)$/.test(this.extension);
    },
    isCanExtendRows() {
      return /^(rows|both)$/.test(this.extension);
    },
    isCanRemoveRow() {
      return this.removeRowEventName ? true : false;
    },
    //---------------------------------------------------
    SheetColumnList() {
      let list = [];
      // Make list by dataWidth
      if (_.isEmpty(this.columns)) {
        for (let i = 0; i < this.dataWidth; i++) {
          let colKey = Ti.Num.toBase26(i);
          let col = {
            index: i,
            key: colKey,
            name: colKey,
            title: colKey,
            width: this.defaultCellWidth,
            comType: this.cellComType || "TiInput",
            comConf: this.cellComConf || {
              autoSelect: true,
              focused: true,
              value: "=@CellValue",
              style: {
                width: "100%",
                "min-width": "1rem"
              }
            }
          };
          list.push(col);
        }
      }
      // Upgrade defination by default
      else {
        _.forEach(
          this.columns,
          (
            {
              name,
              title,
              width = this.defaultCellWidth,
              readonly = this.cellReadonly,
              dict,
              transformer,
              type,
              display,
              autoSort,
              emptyAsNull = true,
              comType,
              comConf,
              mergeConf = true
            },
            index
          ) => {
            //.....................................
            let key = Ti.Num.toBase26(index);
            //.....................................
            if (mergeConf) {
              let conf = _.cloneDeep(this.cellComConf) || {
                autoSelect: true,
                focused: true,
                value: "=@CellValue",
                style: {
                  width: "100%",
                  "min-width": "1rem"
                }
              };
              comConf = _.merge(conf, comConf);
            }
            //.....................................
            let col = {
              index,
              key,
              readonly,
              autoSort,
              emptyAsNull,
              name: name || key,
              title: title || name || key,
              type,
              width,
              display,
              comType: comType || this.cellComType || "TiInput",
              comConf
            };
            //.....................................
            if (dict) {
              col.$dict = Ti.DictFactory.CheckDict(dict);
            }
            //.....................................
            if (transformer) {
              col.transformer = Ti.Util.genInvoking(transformer);
            }
            //.....................................
            list.push(col);
          }
        );
      }
      // Done
      return list;
    },
    //---------------------------------------------------
    /**
     * @returns Column index map by:
     *   - `index` : "#0"
     *   - `key`   : "@A"
     *   - `name`  : "age"
     */
    SheetColumnMap() {
      let re = {};
      _.forEach(this.SheetColumnList, (col) => {
        let { index, key, name } = col;
        re[`#${index}`] = col;
        re[`@${key}`] = col;
        re[name] = col;
      });
      return re;
    },
    //---------------------------------------------------
    /**
     * The sheet display columns, by max-value of dataWidth and columns.length,
     * if columns is not empty
     */
    SheetDisplayColumns() {
      return this.SheetColumnList;
    }
    //---------------------------------------------------
  },
  methods: {
    //---------------------------------------------------
    OnClickCell({ cellKey, x, y }) {
      // Eval com
      this.evalActivedCellCom(cellKey, x, y);
      // Then display it
      this.myActivedCellKey = cellKey;
    },
    //---------------------------------------------------
    OnCancelCell() {
      this.evalActivedCellCom(null);
    },
    //---------------------------------------------------
    OnCellChange(val, { cellKey, x, y }) {
      //console.log("SheetTable CellChanged", { cellKey, x, y, val })
      // Default, empty value as null
      let col = this.SheetColumnList[x];
      let { type, emptyAsNull, autoSort } = col;
      // pre-treat value
      if (
        emptyAsNull &&
        (Ti.Util.isNil(val) || (_.isArray(val) && _.isEmpty(val)))
      ) {
        val = null;
      }
      // sort value when array
      if (autoSort && _.isArray(val)) {
        val.sort();
      }
      // Convert type
      if (type) {
        let fnName = Ti.Types.getFuncByType(type);
        let typeFn = Ti.Types.evalFunc(fnName);
        val = typeFn(val);
      }
      // Notify cell change
      if (this.cellChangeEventName) {
        this.$notify(this.cellChangeEventName, {
          x,
          y,
          key: cellKey,
          name: col.name,
          title: col.title,
          value: val
        });
      }

      // Notify row change
      if (this.rowChangEventeName) {
        let item = this.getRowDataByIndex(y);
        if (Ti.Util.isNil(val)) {
          delete item[col.name];
        } else {
          item[col.name] = val;
        }
        this.$notify(this.rowChangEventeName, {
          index: y,
          col,
          item
        });
      }

      // Notify change
      if (this.dataChangeEventName) {
        let data = _.cloneDeep(this.SheetData);
        data[cellKey] = val;
        this.$notify(this.dataChangeEventName, data);
      }
    },
    //---------------------------------------------------
    OnClickRowCreator() {
      if (this.myNextRowAmount) {
        this.$notify("create:row", this.myNextRowAmount);
      }
    },
    //---------------------------------------------------
    OnClickRowDeletor(row) {
      if (this.removeRowEventName) {
        //console.log("SheetTable CellRemove", row)
        this.$notify("remove:row", row);
      }
    },
    //---------------------------------------------------
    /**
     *
     * @param {String} cellKey cell key like `A1`
     *
     * @return `{x:0, y:0}`
     */
    getCellIndexByKey(cellKey) {
      let m = /^([A-Z]+)(\d+)$/.exec(cellKey);
      if (!m) {
        throw `Invalid cellKey format : "${cellKey}"`;
      }
      return {
        x: Ti.Num.fromBase26(m[1]),
        y: parseInt(m[2]) - 1
      };
    },
    //---------------------------------------------------
    /**
     * Get a data key
     *
     * @param {Number} x 0 base column index
     * @param {Number} y 0 base row index
     */
    getCellKeyByIndex(x = 0, y = 0) {
      let key = Ti.Num.toBase26(x);
      return `${key}${y + 1}`;
    },
    //---------------------------------------------------
    /**
     * Gen a var-context for dataKey rendering.
     *
     * @param {Number} x 0 base column index
     * @param {Number} y 0 base row index
     */
    getCellValueByIndex(x, y) {
      let key = this.getCellKeyByIndex(x, y);
      let val = this.SheetData[key];
      return val;
    },
    //---------------------------------------------------
    /**
     *
     * @param {Number} y 0 base row index
     */
    getRowDataByIndex(y) {
      let re = {};
      for (let col of this.SheetColumnList) {
        let { index, name } = col;
        let val = this.getCellValueByIndex(index, y);
        if (!_.isUndefined(val)) {
          re[name] = val;
        }
      }
      return re;
    },
    //---------------------------------------------------
    getRowDataList() {
      let list = [];
      for (let row of this.SheetRowList) {
        let obj = this.getRowDataByIndex(row.index);
        list.push(obj);
      }
      return list;
    },
    //---------------------------------------------------
    evalActivedCellCom(cellKey, x, y) {
      // Cancel Actived cell com
      if (!cellKey) {
        this.myActivedCellKey = null;
        this.myActivedCellComType = null;
        this.myActivedCellComConf = {};
        return;
      }
      // Get back x/y from cellKey
      if (_.isUndefined(x)) {
        let pos = this.getCellIndexByKey(cellKey);
        x = pos.x;
        y = pos.y;
      }
      //................................
      let cellVal = this.SheetData[cellKey];
      let col = this.SheetColumnList[x];
      let item = this.getRowDataByIndex(y);
      item["@CellValue"] = cellVal;
      _.assign(item, {
        column: col,
        rowIndex: y,
        rowI: y + 1,
        colIndex: x,
        cellKey,
        sheetData: this.SheetData,
        forCellCom: true,
        vars: this.vars
      });
      //................................
      let comConf = _.cloneDeep(col.comConf);
      if (!comConf.value) {
        comConf.value = "=@CellValue";
      }
      // Setup editing component
      this.myActivedCellComType = col.comType;
      this.myActivedCellComConf = Ti.Util.explainObj(item, comConf, {
        evalFunc: true
      });
    },
    //---------------------------------------------------
    /**
     * let myMatrix = [{
     *    // extend {SheetRowList}
     *    index: 0,      // 0 base row index
     *    // extend {SheetColumnList}
     *    cells: [
     *       {
     *          index, key, name, title, readonly,
     *          value, displayText,
     *          actived, className,
     *          rowIndex, x, y
     *       }
     *    ]
     * }]
     */
    async evalSheetMatrix() {
      //console.log("evalSheetMatrix()", this.dataHeight);
      const sheetData = _.cloneDeep(this.SheetData);
      // Eval display text
      const genCellDisplayText = async (cellVal, options) => {
        if (_.isArray(cellVal)) {
          let vList = [];
          for (let cv of cellVal) {
            let v2 = await genCellDisplayText(cv, options);
            vList.push(v2);
          }
          return vList.join(",");
        }
        let col = options.column;
        let displayText = cellVal;
        if (col.$dict) {
          displayText = await col.$dict.getItemText(cellVal);
        }

        // 准备上下文
        let context = {
          ...options,
          vars: this.vars
        };

        if (_.isFunction(col.transformer)) {
          displayText = col.transformer(displayText, context);
        }
        if (!displayText && col.comConf && col.comConf.placeholder) {
          return Ti.Util.explainObj(context, col.comConf.placeholder, {
            evalFunc: true
          });
        }
        return displayText;
      };
      // Gen matrix
      let matrix = [];
      for (let y = 0; y < this.dataHeight; y++) {
        // Explain cells
        let cells = [];
        for (let col of this.SheetDisplayColumns) {
          let x = col.index;
          //................................
          let cellKey = this.getCellKeyByIndex(x, y);
          let cellVal = this.SheetData[cellKey];
          let actived = this.myActivedCellKey == cellKey;
          //................................
          let displayText = await genCellDisplayText(cellVal, {
            column: col,
            rowIndex: y,
            rowI: y + 1,
            colIndex: x,
            cellKey,
            sheetData
          });
          let context = {
            text: displayText,
            value: cellVal
          };
          //................................
          // Eval display
          let dis = col.display || {
            major: "=text"
          };
          let display = Ti.Util.explainObj(context, dis);
          //................................
          let cell = _.assign(_.cloneDeep(col), {
            actived,
            className: {
              "is-nil": _.isNil(cellVal),
              "is-actived": actived,
              "no-actived": !actived,
              "is-readonly": col.readonly,
              "no-readonly": !col.readonly
            },
            cellKey,
            rowIndex: y,
            x,
            y,
            value: cellVal,
            ...display,
            showMajor: !Ti.Util.isNil(display.major),
            showSuffix: !Ti.Util.isNil(display.suffix)
          });
          //................................
          cells.push(cell);
        }

        // Join to matrix
        matrix.push({
          index: y,
          cells
        });
      }
      this.myMatrix = matrix;
      //console.log("evalSheetMatrix() -> ", matrix.length)
      // Re-eval actived com if it has had
      if (this.myActivedCellKey) {
        this.evalActivedCellCom(this.myActivedCellKey);
      }
    },
    //---------------------------------------------------
    tryEvalMatrix(newVal, oldVal) {
      if (!_.isEqual(newVal, oldVal)) {
        this.evalSheetMatrix();
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch: {
    "data": "tryEvalMatrix",
    "vars": "tryEvalMatrix",
    "dataWidth": "tryEvalMatrix",
    "dataHeight": "tryEvalMatrix",
    "myActivedCellKey": "tryEvalMatrix"
  },
  ///////////////////////////////////////////////////////
  mounted: async function () {
    await this.evalSheetMatrix();
  }
  ///////////////////////////////////////////////////////
};
