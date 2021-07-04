const _M = {
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    },
    //------------------------------------------------
    ActionItems() {
      let items = [
        {
          icon: this.newItemIcon,
          text: this.newItemText,
          action: () => {
            this.doAddNewItem()
          }
        },
        { type: "line" },
        {
          icon: "far-trash-alt",
          tip: "i18n:del-checked",
          action: () => {
            this.removeChecked()
          }
        }
      ]
      if (this.itemEditable) {
        items.push(
          {
            icon: "far-edit",
            tip: "i18n:edit",
            action: () => {
              this.doEditCurrentMeta()
            }
          },
          { type: "line" }
        )
      }
      items.push(
        {
          icon: "fas-long-arrow-alt-up",
          tip: "i18n:move-up",
          action: () => {
            this.moveCheckedUp()
          }
        },
        {
          icon: "fas-long-arrow-alt-down",
          tip: "i18n:move-down",
          action: () => {
            this.moveCheckedDown()
          }
        },
        { type: "line" },
        {
          icon: "fas-code",
          tip: "i18n:source",
          action: () => {
            this.doEditCurrentSource()
          }
        }
      )
      return items
    },
    //------------------------------------------------
    TheValue() {
      if (!this.value) {
        return []
      }
      if (_.isString(this.value)) {
        return JSON.parse(this.value)
      }
      return this.value
    },
    //------------------------------------------------
    TableConfig() {
      let config = _.cloneDeep(this.list)
      config.data = this.TheValue
      _.defaults(config, {
        blankAs: this.blankAs,
        blankClass: this.blankClass,
        multi: true,
        checkable: true
      })
      return config
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //-----------------------------------------------
    OnInitTable($table) {
      this.$table = $table
    },
    //-----------------------------------------------
    OnTableRowSelect({ currentId, current, currentIndex, checkedIds }) {
      // this.myCurrentData = current
      // this.myCurrentId = currentId
      // this.myCurrentIndex = currentIndex
      // this.myCheckedIds = checkedIds
    },
    //-----------------------------------------------
    async OnTableRowOpen({ index, rawData }) {
      let reo = await this.openDialogForMeta(rawData);

      // User cancel
      if (_.isUndefined(reo))
        return

      // Join to 
      let list = _.cloneDeep(this.TheValue || [])
      list.splice(index, 1, reo)
      this.notifyChange(list)
    },
    //-----------------------------------------------
    async doAddNewItem() {
      //console.log("doAddNewItem")
      let reo = await this.openDialogForMeta();
      //console.log(reo)
      // User cancel
      if (_.isUndefined(reo))
        return

      // Join to 
      let list = _.cloneDeep(this.TheValue || [])
      let val = _.concat(list || [], reo)
      this.notifyChange(val)
    },
    //-----------------------------------------------
    async doEditCurrentMeta() {
      let row = this.$table.getCurrentRow()
      if (!row) {
        return await Ti.Toast.Open("i18n:nil-item", "warn")
      }
      let { rawData, index } = row
      let reo = await this.openDialogForMeta(rawData);

      // User cancel
      if (_.isUndefined(reo))
        return

      // Join to 
      let list = _.cloneDeep(this.TheValue || [])
      list.splice(index, 1, reo)
      this.notifyChange(list)
    },
    //-----------------------------------------------
    async doEditCurrentSource() {
      let json = this.value || "[]"
      if (!_.isString(json)) {
        json = JSON.stringify(json, null, '   ')
      }
      json = await this.openDialogForSource(json);

      // User cancel
      if (_.isUndefined(json))
        return

      // Join to 
      try {
        let list = JSON.parse(json)
        this.notifyChange(list)
      }
      // Invalid json
      catch (E) {
        await Ti.Toast.Open("" + E)
      }
    },
    //-----------------------------------------------
    removeChecked() {
      let { checked, remains } = this.$table.removeChecked()
      if (_.isEmpty(checked))
        return

      this.notifyChange(remains)
    },
    //-----------------------------------------------
    moveCheckedUp() {
      let { list, nextCheckedIds } = this.$table.moveChecked(-1)

      this.notifyChange(list)
      this.$nextTick(() => {
        this.$table.checkRow(nextCheckedIds)
      })
    },
    //-----------------------------------------------
    moveCheckedDown() {
      let { list, nextCheckedIds } = this.$table.moveChecked(1)

      this.notifyChange(list)
      this.$nextTick(() => {
        this.$table.checkRow(nextCheckedIds)
      })
    },
    //-----------------------------------------------
    async openDialogForMeta(result = {}) {
      let dialog = _.assign({
        title: "i18n:edit",
        width: 500,
        height: 500
      }, this.dialog, {
        result,
        model: { prop: "data", event: "change" },
        comType: "TiForm",
        comConf: this.form
      })
      return await Ti.App.Open(dialog);
    },
    //-----------------------------------------------
    async openDialogForSource(json = '[]') {
      let dialog = _.assign({
        title: "i18n:edit",
        width: 500,
        height: 500
      }, this.dialog, {
        result: json,
        comType: "TiInputText",
        comConf: {
          height: "100%"
        }
      })

      return await Ti.App.Open(dialog);
    },
    //-----------------------------------------------
    notifyChange(val = []) {
      if ("String" == this.valueType) {
        val = JSON.stringify(val, null, '   ')
      }
      this.$notify("change", val)
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    //----------------------------------------------- 
    //-----------------------------------------------
  }
  ////////////////////////////////////////////////////
}
export default _M;