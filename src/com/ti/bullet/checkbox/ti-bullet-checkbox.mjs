const _M = {
  //////////////////////////////////////////
  data: () => ({
    myTypeName: "ti-check-list",
  }),
  //////////////////////////////////////////
  props: {
    "valueType": {
      type: String,
      default: "Array",
      validator: (v) => /^(Array|Object|String|Json(Array|Object))$/.test(v),
    },
    // Only for valueType=="String"
    "valueSep": {
      type: String,
      default: ",",
    },
    // Only for valueType=="Json(Array|Object)"
    "formatJson": {
      type: Boolean,
      default: false,
    },
    "bulletIconOn": {
      type: String,
      default: "fas-check-square",
    },
    "bulletIconOff": {
      type: String,
      default: "far-square",
    },
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    ToJson() {
      if (this.formatJson) {
        return function (input) {
          return JSON.stringify(input, null, "   ");
        };
      }
      return function (input) {
        return JSON.stringify(input);
      };
    },
    //--------------------------------------
    ValueMap() {
      let v = this.value;
      // Parse As JSON
      if (/^Json/.test(this.valueType) && _.isString(v)) {
        let vs = _.trim(v);
        if (vs) {
          v = JSON.parse(vs);
        } else {
          v = {};
        }
      }

      let re = {};

      // Array
      if (_.isArray(v)) {
        _.forEach(v, (k) => (re[k] = true));
        return re;
      }
      // Object
      if (_.isObject(v)) {
        return v || {};
      }
      // Build map
      else if (!_.isEmpty(v)) {
        let list = [];
        // Common Sep String
        if (_.isString(v)) {
          list = Ti.S.splitIgnoreBlank(v, this.valueSep);
        } else {
          list.push("" + v);
        }

        // Map
        for (let li of list) {
          re[li] = true;
        }
      }
      return re;
    },
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnClickOptionItem({ value }) {
      let vals = [];
      _.forEach(this.ItemGroups, (grp) => {
        _.forEach(grp.items, (it) => {
          if (this.isItemChecked(it.value, this.value)) {
            if (!_.isEqual(value, it.value)) {
              vals.push(it.value);
            }
          }
          // check it
          else if (_.isEqual(value, it.value)) {
            vals.push(it.value);
          }
        });
      });

      this.formatAndNotifyChange(vals);
    },
    //--------------------------------------
    isItemChecked(itValue) {
      return this.ValueMap[itValue] || false;
    },
    //--------------------------------------
    getItemsCheckMode(items = []) {
      let lbItem = null;
      let lbSumN = 0;
      let lbChxN = 0;
      let sumN = 0;
      let chxN = 0;

      const _check_mode = (sumN, chxN) => {
        return chxN == 0 ? "none" : sumN == chxN ? "all" : "part";
      };

      for (let it of items) {
        if ("Label" == it.type) {
          if (lbItem) {
            lbItem.checkMode = _check_mode(lbSumN, lbChxN);
            sumN += lbSumN;
            chxN += lbChxN;
          }
          lbItem = it;
          lbSumN = 0;
          lbChxN = 0;
        } else {
          lbSumN++;
          if (this.isItemChecked(it.value)) {
            lbChxN++;
          }
        }
      }
      if (lbItem) {
        lbItem.checkMode = _check_mode(lbSumN, lbChxN);
      }
      // Join summary
      sumN += lbSumN;
      chxN += lbChxN;

      return _check_mode(sumN, chxN);
    },
    //--------------------------------------
    doSelectToggle({ checkMode = "none", index, groupIndex } = {}) {
      //console.log("doSelectToggle", checkMode);
      // Label in group
      if (groupIndex >= 0) {
        alert("这个功能实现起来有点难，改天再说吧 ^_^!")
      }
      // Whole group
      else {
        if ("all" == checkMode) {
          this.cancelAllValues();
        } else {
          this.selectAllValues();
        }
      }
    },
    //--------------------------------------
    selectAllValues() {
      let vals = _.map(this.myOptionsData, (it) => it.value);
      this.formatAndNotifyChange(_.without(vals, undefined));
    },
    //--------------------------------------
    cancelAllValues() {
      this.formatAndNotifyChange([]);
    },
    //--------------------------------------
    formatAndNotifyChange(vals) {
      // Object or JsonObject
      if (/Object$/.test(this.valueType)) {
        let map = {};
        for (let v of vals) {
          map[v] = true;
        }
        if ("JsonObject" == this.valueType) {
          vals = this.ToJson(map);
        } else {
          vals = map;
        }
      } else if ("JsonArray" == this.valueType) {
        vals = this.ToJson(vals);
      } else if ("String" == this.valueType) {
        val = val.join(this.valueSep);
      }
      this.tryNotifyChange(vals);
    },
    //--------------------------------------
  },
  //////////////////////////////////////////
};
export default _M;
