export default {
  /////////////////////////////////////////////////////
  data: () => ({
    loading: false,
    myFixedOptionsData: [],
    myOptionsData: [],
    myValueMap: {},
    myLastIndex: 0,
    myFocusIndex: -1
  }),
  /////////////////////////////////////////////////////
  computed: {
    //-------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //-------------------------------------------------
    FixedDict() {
      return this.genDict(this.fixedOptions);
    },
    //-------------------------------------------------
    Dict() {
      return this.genDict(this.options);
    },
    //-------------------------------------------------
    TheItems() {
      let list = [];
      const __gen_items = (it, index) => {
        let itV = this.Dict.getValue(it);
        let text = this.Dict.getText(it);
        text = Ti.I18n.text(text);
        let tip;
        if (this.autoValueTip) {
          tip = {
            "data-ti-tip": `<strong>${text}</strong>: <codd>${itV}</code>`,
            "data-ti-tip-mode": "H",
            "data-ti-tip-size": "auto",
            "data-ti-tip-type": "paper",
            "data-ti-tip-content-type": "html",
            "data-ti-keyboard": "ctrl"
          };
        }
        let selected =
          this.myValueMap[itV] ||
          (Ti.Util.isNil(itV) && Ti.Util.isNil(this.value) && !this.multi);
        return {
          index,
          className: {
            "is-selected": selected,
            "is-focused": index == this.myFocusIndex
          },
          text,
          tip,
          value: itV,
          icon: this.Dict.getIcon(it) || this.defaultIcon
        };
      };

      _.forEach(this.myFixedOptionsData, (it, index) => {
        let item = __gen_items(it, index);
        if (item) {
          list.push(item);
        }
      });

      _.forEach(this.myOptionsData, (it, index) => {
        let item = __gen_items(it, index);
        if (item) {
          list.push(item);
        }
      });

      return list;
    }
    //-------------------------------------------------
  },
  /////////////////////////////////////////////////////
  methods: {
    //-------------------------------------------------
    OnClickItem({ value, index }, $event) {
      if (this.readonly) return;
      let toggle = $event.ctrlKey || $event.metaKey || this.autoToggle;
      let shift = $event.shiftKey;
      // Multi + Shift Mode
      if (shift && this.multi) {
        this.selectItemsToCurrent(value, index);
      }
      // Multi + Toggle Mode
      else if (toggle && this.multi) {
        this.toggleItem(value);
      }
      // Toggle Mode
      else if (this.allowEmpty) {
        this.toggleItem(value);
      }
      // Single Mode
      else {
        this.tryNotifyChanged({ [value]: true });
      }
      // Last Index
      this.myLastIndex = index;
    },
    //-------------------------------------------------
    OnMouseDown({ index }) {
      if (this.readonly) return;
      this.myFocusIndex = index;
    },
    //-------------------------------------------------
    // Utility
    //-------------------------------------------------
    findItemIndexByValue(val) {
      for (let it of this.TheItems) {
        if (it.value == val) return it.index;
      }
      return -1;
    },
    //-------------------------------------------------
    selectItemsToCurrent(val) {
      let vmap = _.cloneDeep(this.myValueMap);
      let index = this.findItemIndexByValue(val);
      if (index >= 0) {
        let fromIndex = Math.min(index, this.myLastIndex);
        let toIndex = Math.max(index, this.myLastIndex);
        if (fromIndex < 0) {
          fromIndex = 0;
        }
        for (let i = fromIndex; i <= toIndex; i++) {
          let it = this.TheItems[i];
          vmap[it.value] = true;
        }
      }
      this.tryNotifyChanged(vmap);
    },
    //-------------------------------------------------
    toggleItem(val) {
      let oldV = this.myValueMap[val];
      let vmap;
      if (this.multi) {
        vmap = _.assign({}, this.myValueMap, {
          [val]: !oldV
        });
      } else {
        vmap = { [val]: !oldV };
      }
      this.tryNotifyChanged(vmap);
    },
    //-------------------------------------------------
    tryNotifyChanged(valMap = this.myValueMap) {
      let vals = [];
      _.forEach(this.TheItems, ({ value }) => {
        if (valMap[value]) {
          vals.push(value);
        }
      });
      if (!_.isEqual(vals, this.Values)) {
        let v;
        if (_.isFunction(this.joinBy)) {
          v = this.joinBy(vals);
        } else if (this.multi) {
          if (this.joinBy) {
            v = vals.join(this.joinBy);
          } else {
            v = vals;
          }
        } else if (vals.length > 1) {
          v = vals.join(this.joinBy || ",");
        } else {
          v = _.first(vals);
        }
        //console.log("tryNotifyChanged", v);
        if (!_.isEqual(v, this.value)) {
          if (!_.isNumber(v) && !_.isBoolean(v) && _.isEmpty(v)) {
            v = this.emptyAs;
          }
          if ("null" === v) {
            v = null;
          }
          this.$notify("change", v);
        }
      }
    },
    //......................................
    async reloadMyOptionsData() {
      this.myFixedOptionsData = await this.FixedDict.getData();
      this.myOptionsData = await this.Dict.getData();
    },
    //......................................
    reloadMyValueMap() {
      let sep = null;
      if (this.autoSplitValue) {
        if (_.isBoolean(this.autoSplitValue)) {
          sep = /[:,;\t\n\/]+/g;
        } else {
          sep = this.autoSplitValue;
        }
      }

      let vals = Ti.S.toArray(this.value, { sep });
      let vmap = {};
      _.forEach(vals, (v) => (vmap[v] = true));
      this.myValueMap = vmap;
    },
    //......................................
    genDict(options) {
      // Customized
      if (options instanceof Ti.Dict) {
        return options;
      }
      // Refer dict
      if (_.isString(options)) {
        let dictName = Ti.DictFactory.DictReferName(options);
        if (dictName) {
          return Ti.DictFactory.CheckDict(dictName, ({ loading }) => {
            this.loading = loading;
          });
        }
      }
      return Ti.DictFactory.GetOrCreate(
        {
          data: options,
          getValue: Ti.Util.genGetter(this.valueBy || "value"),
          getText: Ti.Util.genGetter(this.textBy || "text|name"),
          getIcon: Ti.Util.genGetter(this.iconBy || "icon")
        },
        {
          hooks: ({ loading }) => (this.loading = loading)
        }
      );
    }
    //......................................
  },
  /////////////////////////////////////////
  watch: {
    "options": {
      handler: "reloadMyOptionsData",
      immediate: true
    },
    "value": {
      handler: "reloadMyValueMap",
      immediate: true
    }
  },
  /////////////////////////////////////////
  mounted: async function () {
    Ti.Dom.watchDocument("mouseup", () => (this.myFocusIndex = -1));
  },
  /////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Dom.unwatchDocument("mouseup", this.__on_mouseup);
  }
  /////////////////////////////////////////
};
