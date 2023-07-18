const _M = {
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "value": {
      type: [Array, String],
      default: () => []
    },
    "valueSep": {
      type: String,
      default: ","
    },
    "autoJsValue": {
      type: Boolean,
      default: false
    },
    "dftNewItem": {
      type: [Number, String, Object],
      default: null
    },
    //------------------------------------------------
    // Behaviors
    //------------------------------------------------
    "eleComType": {
      type: String,
      default: "TiInput"
    },
    "eleComConf": {
      type: Object,
      default: () => ({
        hideBorder: true,
        autoSelect: true,
        autoJsValue: true
      })
    },
    "canAddNewItem": {
      type: Boolean,
      default: true
    },
    "canRemoveItem": {
      type: Boolean,
      default: true
    },
    "newItemDialog": {
      type: Object,
      default: () => ({
        mode: "prompt"
      })
    },
    //------------------------------------------------
    // Aspect
    //------------------------------------------------
    "blankAs": {
      type: Object,
      default: () => ({
        className: "as-small-tip",
        icon: "fas-border-none",
        text: "i18n:empty"
      })
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-empty": this.isEmpty,
        "no-empty": !this.isEmpty
      });
    },
    //------------------------------------------------
    isEmpty() {
      return _.isEmpty(this.ListItems);
    },
    //------------------------------------------------
    TheValue() {
      if (_.isEmpty(this.value)) {
        return [];
      }
      if (_.isString(this.value)) {
        if (/^\[([^\]]*)\]$/.test(this.value)) {
          return JSON.parse(this.value);
        }
        return Ti.S.splitIgnoreBlank(this.value, this.valueSep);
      }
      return _.concat(this.value);
    },
    //------------------------------------------------
    getEleComType() {
      if (_.isString(this.eleComType)) {
        return () => this.eleComType;
      }
      if (_.isFunction(this.eleComType)) {
        return this.eleComType;
      }
      if (_.isObject(this.eleComType)) {
        return (val) => {
          return _.get(this.eleComType[val]);
        };
      }
      if (_.isArray(this.eleComType)) {
        return (val, index) => {
          return _.nth(this.eleComType, index);
        };
      }
      return "TiInput";
    },
    //------------------------------------------------
    getEleComConf() {
      let conf;
      if (_.isFunction(this.eleComConf)) {
        conf = this.eleComConf;
      } else {
        conf = this.eleComConf;
      }
      return (value, index) => {
        return Ti.Util.explainObj({ value, index }, conf);
      };
    },
    //------------------------------------------------
    ListItems() {
      let items = [];
      _.forEach(this.TheValue, (value, index) => {
        let comType = this.getEleComType(value, index);
        let comConf = this.getEleComConf(value, index);
        items.push({
          index,
          value,
          comType,
          comConf
        });
      });
      return items;
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    OnValueChange({ index, value }, newVal) {
      if (!_.isEqual(value, newVal)) {
        let val = newVal;
        if (this.autoJsValue) {
          val = Ti.S.toJsValue(val, {
            autoNil: true,
            autoDate: false,
            trimed: true
          });
        }
        let list = _.cloneDeep(this.TheValue) || {};
        list[index] = val;
        this.tryNotifyChange(list);
      }
    },
    //------------------------------------------------
    OnDeleteItem({ index }) {
      let list = [];
      _.forEach(this.TheValue, (v, i) => {
        if (i != index) {
          list.push(v);
        }
      });
      this.tryNotifyChange(list);
    },
    //------------------------------------------------
    async OnAddNewItem() {
      let list = _.cloneDeep(this.TheValue) || {};
      let newItem = _.cloneDeep(this.dftNewItem);
      if (this.newItemDialog) {
        let dia = _.cloneDeep(this.newItemDialog);
        let re;
        if ("prompt" == dia.mode) {
          let msg = dia.msg || "i18n:add-item";
          dia = _.omit(dia, "prompt", "mode");
          _.defaults(dia, {
            placeholder: msg
          });
          re = await Ti.Prompt(msg, dia);
        }
        // Cutomized dialog
        else {
          _.defaults(dia, {
            title: "i18n:new",
            position: "center",
            width: "6.4rem",
            height: "2rem",
            result: newItem,
            comType: "TiInput",
            comConf: {
              style: {
                padding: "1em",
                height: "unset"
              },
              placeholder: "i18n:new-item"
            }
          });
          re = await Ti.App.Open(dia);
        }

        if (!re) {
          return;
        }
        newItem = re;
      }
      list.push(newItem);
      this.tryNotifyChange(list);
    },
    //------------------------------------------------
    OnClear() {
      this.tryNotifyChange(null);
    },
    //------------------------------------------------
    async OnEditCode() {
      let json = JSON.stringify(this.value, null, "    ");
      let re = await Ti.EditCode(json, {
        mode: "json",
        textOk: "i18n:ok",
        textCancel: "i18n:cancel"
      });
      if (Ti.Util.isNil(re)) {
        return;
      }
      try {
        re = _.trim(re) || "[]";
        let val = JSON.parse(re);
        this.tryNotifyChange(val);
      } catch (err) {
        await Ti.Alert("i18n:invalid-format", { type: "error" });
      }
    },
    //------------------------------------------------
    tryNotifyChange(list) {
      if (!_.isEqual(list, this.TheValue)) {
        this.$notify("change", list);
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
};
export default _M;
