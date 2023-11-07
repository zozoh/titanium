const _M = {
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "full-field": this.fitField
      });
    },
    //------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      });
    },
    //------------------------------------------------
    ActionItems() {
      let items = [
        {
          icon: this.newItemIcon,
          text: this.newItemText,
          action: () => {
            this.doAddNewItem();
          }
        },
        {},
        {
          icon: "far-trash-alt",
          tip: "i18n:del-checked",
          action: () => {
            this.removeChecked();
          }
        }
      ];
      if (this.itemEditable) {
        items.push(
          {
            icon: "far-edit",
            tip: "i18n:edit",
            action: () => {
              this.doEditCurrentMeta();
            }
          },
          {}
        );
      }
      items.push(
        {
          icon: "fas-long-arrow-alt-up",
          tip: "i18n:move-up",
          action: () => {
            this.moveCheckedUp();
          }
        },
        {
          icon: "fas-long-arrow-alt-down",
          tip: "i18n:move-down",
          action: () => {
            this.moveCheckedDown();
          }
        },
        {},
        {
          icon: "fas-code",
          tip: "i18n:source",
          action: () => {
            this.doEditCurrentSource();
          }
        }
      );
      if (!_.isEmpty(this.moreActions)) {
        items.push({});
        _.forEach(this.moreActions, (ma) => {
          let handler = ma.action;
          if (_.isFunction(handler)) {
            items.push({
              icon: ma.icon,
              text: ma.text,
              tip: ma.tip,
              altDisplay: ma.altDisplay,
              enabled: ma.enabled,
              disabled: ma.disabled,
              highlight: ma.highlight,
              action: () => {
                this.doInvokeAction(handler);
              }
            });
          }
        });
      }
      return items;
    },
    //------------------------------------------------
    TheValue() {
      if (!this.value) {
        return [];
      }
      if (_.isString(this.value)) {
        return JSON.parse(this.value);
      }
      return this.value;
    },
    //------------------------------------------------
    isQuickTable() {
      if (_.isString(this.quickTable)) {
        return Ti.Util.explainObj(this, this.quickTable);
      }
      return Ti.AutoMatch.test(this.quickTable, this.vars);
    },
    //------------------------------------------------
    TableConfig() {
      let config = this.getDataByVars(this.list);
      config.data = this.TheValue;
      _.defaults(config, {
        blankAs: _.assign(
          {
            className: "as-mid-tip",
            icon: "fab-deezer",
            text: "empty-data"
          },
          this.blankAs
        ),
        multi: true,
        checkable: true
      });
      return config;
    },
    //------------------------------------------------
    GenNewItemId() {
      if (this.newItemIdBy) {
        return Ti.Util.genInvoking(this.newItemIdBy);
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //-----------------------------------------------
    OnInitTable($table) {
      this.$table = $table;
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
      if (_.isUndefined(reo)) return;

      // Join to
      let list = _.cloneDeep(this.TheValue || []);
      list.splice(index, 1, reo);
      this.notifyChange(list);
    },
    //-----------------------------------------------
    async doInvokeAction(handler = _.identity) {
      let currentId = this.$table.theCurrentId;
      let checkedIds = this.$table.theCheckedIds;
      let payload = this.$table.getEmitContext(currentId, checkedIds);
      let newVal = await handler(payload, this.TheValue);
      console.log(newVal);
      if (newVal && _.isArray(newVal)) {
        this.notifyChange(newVal);
      }
    },
    //-----------------------------------------------
    async doAddNewItem() {
      //console.log("doAddNewItem")
      let newItHandle;
      if (_.isFunction(this.onAddNewItem)) {
        newItHandle = this.onAddNewItem;
      }
      // Dynamic string
      else if (_.isString(this.onAddNewItem)) {
        newItHandle = Ti.Util.genInvoking(this.onAddNewItem);
      }
      // Default
      else {
        newItHandle = async () => {
          let newIt = _.assign({}, _.cloneDeep(this.newItemData));
          if (this.newItemIdKey && _.isFunction(this.GenNewItemId)) {
            let newItId = this.GenNewItemId(this.TheValue);
            if (newItId) {
              newIt[this.newItemIdKey] = newItId;
            }
          }
          return await this.openDialogForMeta(newIt);
        };
      }

      // Do add
      let reo = await newItHandle(this.TheValue);

      //console.log(reo);
      // User cancel
      if (_.isUndefined(reo)) return;

      let newItems = _.concat([], reo);

      // Assign new ID
      if (_.isFunction(this.GenNewItemId) && !_.isEmpty(newItems)) {
        for (let it of newItems) {
          if (Ti.Util.isNil(it[this.newItemIdKey])) {
            let itemId = this.GenNewItemId(this.TheValue);
            _.set(it, this.newItemIdKey, itemId);
          }
        }
      }

      // Join to
      let list = _.cloneDeep(this.TheValue || []);
      let val = _.concat(list || [], newItems);
      this.notifyChange(val);
    },
    //-----------------------------------------------
    async doEditCurrentMeta() {
      let row = this.$table.getCurrentRow();
      if (!row) {
        return await Ti.Toast.Open("i18n:nil-item", "warn");
      }
      let { rawData, index } = row;
      let reo = await this.openDialogForMeta(rawData);

      // User cancel
      if (_.isUndefined(reo)) return;

      // Join to
      let list = _.cloneDeep(this.TheValue || []);
      list.splice(index, 1, reo);
      this.notifyChange(list);
    },
    //-----------------------------------------------
    async doEditCurrentSource() {
      let json = this.value || "[]";
      if (!_.isString(json)) {
        json = JSON.stringify(json, null, "   ");
      }
      json = await this.openDialogForSource(json);

      // User cancel
      if (_.isUndefined(json)) return;

      // Join to
      try {
        let str = _.trim(json) || "[]";
        let list = JSON.parse(str);
        this.notifyChange(list);
      } catch (E) {
        // Invalid json
        await Ti.Toast.Open("" + E);
      }
    },
    //-----------------------------------------------
    removeChecked() {
      let { checked, remains } = this.$table.removeChecked();
      if (_.isEmpty(checked)) return;

      this.notifyChange(remains);
    },
    //-----------------------------------------------
    moveCheckedUp() {
      let { list, nextCheckedIds } = this.$table.moveChecked(-1);

      this.notifyChange(list);
      this.$nextTick(() => {
        this.$table.checkRow(nextCheckedIds);
      });
    },
    //-----------------------------------------------
    moveCheckedDown() {
      let { list, nextCheckedIds } = this.$table.moveChecked(1);

      this.notifyChange(list);
      this.$nextTick(() => {
        this.$table.checkRow(nextCheckedIds);
      });
    },
    //-----------------------------------------------
    async openDialogForMeta(result = {}) {
      //console.log("openDialogForMeta")
      let dialog = this.getDataByVars(this.dialog);
      let form = this.getDataByVars(this.form);
      let dialogSetting = _.assign(
        {
          title: "i18n:edit",
          width: 500,
          height: 500,
          explainComConf: false
        },
        dialog,
        {
          result,
          model: { prop: "data", event: "change" },
          comType: this.formType,
          comConf: form
        }
      );
      return await Ti.App.Open(dialogSetting);
    },
    //-----------------------------------------------
    async openDialogForSource(json = "[]") {
      let dialog = _.assign({
        title: "i18n:edit",
        position: "bottom",
        width: "73%",
        height: "96%",
        clickMaskToClose: false,
        result: json,
        comType: "TiInputText",
        comConf: {
          height: "100%"
        }
      });

      return await Ti.App.Open(dialog);
    },
    //-----------------------------------------------
    //
    // Utility
    //
    //-----------------------------------------------
    getDataByVars(cans = []) {
      if (_.isArray(cans)) {
        for (let can of cans) {
          let { test, data } = can;
          if (Ti.Util.isNil(test) || Ti.AutoMatch.test(test, this.vars)) {
            return _.cloneDeep(data);
          }
        }
        return _.cloneDeep(_.last(cans));
      }
      return _.cloneDeep(cans);
    },
    //-----------------------------------------------
    notifyChange(val = []) {
      if ("String" == this.valueType) {
        val = JSON.stringify(val, null, "   ");
      }
      this.$notify("change", val);
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    //-----------------------------------------------
    //-----------------------------------------------
  }
  ////////////////////////////////////////////////////
};
export default _M;
