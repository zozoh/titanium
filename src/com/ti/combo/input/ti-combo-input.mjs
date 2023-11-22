const COM_TYPE = "TiComboInput";
const _M = {
  ////////////////////////////////////////////////////
  data: () => ({
    myDropStatus: "collapse",
    myItem: null,
    myFreeValue: null,
    myFilterValue: null,
    myOptionsData: null,
    myCurrentId: null,
    myCheckedIds: {},

    myOldValue: undefined,
    myDict: undefined,
    loading: false
  }),
  ////////////////////////////////////////////////////
  props: {
    "canInput": {
      type: Boolean,
      default: true
    },
    "autoCollapse": {
      type: Boolean,
      default: false
    },
    "showInputFocusValue": {
      type: Boolean,
      default: true
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    isCollapse() {
      return "collapse" == this.myDropStatus;
    },
    isExtended() {
      return "extended" == this.myDropStatus;
    },
    //-----------------------------------------------
    FnOptionFilter() {
      if (_.isFunction(this.optionFilter)) {
        return this.optionFilter;
      }
      if (this.optionFilter) {
        let flt = Ti.Util.explainObj(this.optionVars, this.optionFilter);
        return Ti.AutoMatch.parse(flt);
      }
    },
    //------------------------------------------------
    TopClass() {
      let hasWidth = !Ti.Util.isNil(this.width);
      return this.getTopClass({
        "full-field": !hasWidth
      });
    },
    //------------------------------------------------
    ValueTip() {
      if (this.autoValueTip) {
        let tip = this.value;
        if (this.myItem && this.Dict) {
          let text = this.Dict.getText(this.myItem);
          let value = this.Dict.getValue(this.myItem);
          tip = `<strong>${text}</strong>: <codd>${value}</code>`;
        }
        return {
          "data-ti-tip": tip,
          "data-ti-tip-mode": "H",
          "data-ti-tip-size": "auto",
          "data-ti-tip-type": "paper",
          "data-ti-tip-content-type": "html",
          "data-ti-keyboard": "ctrl"
        };
      }
    },
    //------------------------------------------------
    TheInputProps() {
      return _.assign(
        {},
        {
          // Data
          "format": undefined,
          "valueCase": this.valueCase,
          "trimed": this.trimed,
          "autoJsValue": this.autoJsValue,
          "validator": this.validator,
          // Behavior
          "readonly": !this.canInput || this.readonly,
          "hover": this.hover,
          "prefixIconForClean": this.prefixIconForClean,
          "autoSelect": this.autoSelect,
          "prefixIconNotifyName": this.prefixIconNotifyName,
          "prefixTextNotifyName": this.prefixTextNotifyName,
          "suffixIconNotifyName": this.suffixIconNotifyName,
          "suffixTextNotifyName": this.suffixTextNotifyName,
          "enterKeyNotifyName": this.enterKeyNotifyName,
          // Aspect
          "placeholder": this.placeholder,
          "autoI18n": this.autoI18n,
          "hideBorder": this.hideBorder,
          "prefixIcon": this.prefixIcon,
          "prefixHoverIcon": this.prefixHoverIcon,
          "prefixText": this.prefixText,
          "suffixIcon": this.suffixIcon,
          "suffixText": this.suffixText,
          // Measure
          "width": this.width,
          "height": this.height
        }
      );
    },
    //------------------------------------------------
    InputValue() {
      if (!Ti.Util.isNil(this.myFilterValue)) {
        return this.myFilterValue;
      }
      if (this.myItem && this.Dict) {
        let text = this.Dict.getText(this.myItem);
        let value = this.Dict.getValue(this.myItem);
        if (this.inputValueDisplay) {
          return Ti.Util.explainObj(this.myItem, this.inputValueDisplay, {
            evalFunc: true
          });
        }
        return text || value;
      }
      return this.myFreeValue;
    },
    //------------------------------------------------
    InputFocusValue() {
      if (this.showInputFocusValue) {
        if (!Ti.Util.isNil(this.myFilterValue)) {
          return this.myFilterValue;
        }
        if (this.myItem && this.Dict) {
          let value = this.Dict.getValue(this.myItem);
          return value;
        }
        return this.myFreeValue;
      }
    },
    //------------------------------------------------
    InputPrefixText() {
      if (this.myItem) {
        if (!_.isUndefined(this.inputPrefixTextDisplay)) {
          return Ti.Util.explainObj(this.myItem, this.inputPrefixTextDisplay, {
            evalFunc: true
          });
        }
        return Ti.Util.explainObj(this.myItem, this.prefixText);
        //return this.Dict.getValue(this.myItem)
      }
      return Ti.Util.explainObj(this, this.prefixText);
    },
    //------------------------------------------------
    InputSuffixText() {
      if (this.myItem) {
        if (!_.isUndefined(this.inputSuffixTextDisplay)) {
          return Ti.Util.explainObj(this.myItem, this.inputSuffixTextDisplay, {
            evalFunc: true
          });
        }
        return Ti.Util.explainObj(this.myItem, this.suffixText);
        //return this.Dict.getValue(this.myItem)
      }
      return Ti.Util.explainObj(this, this.suffixText);
    },
    //------------------------------------------------
    GetValueBy() {
      return (it) => this.Dict.getValue(it);
    },
    //------------------------------------------------
    ThePrefixIcon() {
      if (this.loading) {
        return "zmdi-settings zmdi-hc-spin";
      }
      if (!this.prefixIconForClean) {
        return this.prefixIcon;
      }
      let icon = this.prefixIcon;
      if (this.myItem && this.Dict) {
        icon = this.Dict.getIcon(this.myItem) || icon;
      }
      if (this.readonly) {
        return;
      }
      return Ti.Util.fallback(icon, "zmdi-minus");
    },
    //------------------------------------------------
    TheSuffixIcon() {
      if (this.readonly) {
        return;
      }
      return this.statusIcons[this.myDropStatus];
    },
    //------------------------------------------------
    DropComType() {
      return this.dropComType || "ti-list";
    },
    DropComConf() {
      let display = this.dropDisplay;
      if (!display) {
        display = Ti.Config.getComProp(COM_TYPE, "dropDisplay", [
          "text|title|nm::flex-auto is-nowrap",
          "id|value::as-tip-block align-right"
        ]);
      }
      return _.assign(
        {
          display,
          blankAs: {
            className: "as-mid-tip"
          },
          border: this.dropItemBorder
        },
        this.dropComConf,
        {
          data: this.myOptionsData,
          currentId: this.myCurrentId,
          checkedIds: this.myCheckedIds,
          idBy: this.GetValueBy,
          multi: false,
          hoverable: true,
          checkable: false,
          autoCheckCurrent: true,
          dftLabelHoverCopy: false
        }
      );
    },
    //------------------------------------------------
    Dict() {
      if (!this.myDict) {
        this.myDict = this.createDict();
      }
      return this.myDict;
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //-----------------------------------------------
    OnDropListInit($dropList) {
      this.$dropList = $dropList;
    },
    //------------------------------------------------
    OnCollapse() {
      if ("collapse" != this.myDropStatus) {
        this.doCollapse();
      }
    },
    //-----------------------------------------------
    OnInputInputing(val) {
      // Guard
      if (this.readonly) {
        return;
      }
      if (this.filter) {
        this.myFilterValue = val;
        // Auto extends
        if (this.autoFocusExtended) {
          if (!this.isExtended) {
            this.doExtend(false);
          }
        }
        // Reload options data
        if (this.isExtended) {
          this.debReload();
        }
      }
    },
    //-----------------------------------------------
    async OnInputChanged(val, byKeyboardArrow) {
      // Guard
      if (this.readonly) {
        return;
      }
      //console.log("haha", {val, byKeyboardArrow})
      // Clean filter
      this.myFilterValue = null;
      // Clean
      if (!val) {
        this.myItem = null;
        this.myFreeValue = null;
        this.myCheckedIds = {};
        this.myCurrentId = null;
      }
      // Find ...
      else {
        let it = await this.Dict.getItem(val);
        // Matched tag
        if (it) {
          this.myItem = it;
          this.myFreeValue = null;
        } else if (!this.mustInList) {
          this.myItem = null;
          this.myFreeValue = val;
        }
      }
      if (!byKeyboardArrow) {
        this.tryNotifyChanged();
      }
    },
    //-----------------------------------------------
    async OnInputFocused() {
      // Guard
      if (this.readonly) {
        return;
      }
      if (this.autoFocusExtended && !this.isExtended) {
        await this.doExtend();
      }
    },
    //-----------------------------------------------
    async OnClickStatusIcon() {
      // Guard
      if (this.readonly) {
        return;
      }
      if (this.isExtended) {
        await this.doCollapse();
      } else {
        await this.doExtend();
      }
    },
    //-----------------------------------------------
    async OnDropListSelected({ currentId, byKeyboardArrow } = {}) {
      // Guard
      if (this.readonly) {
        return;
      }
      //console.log({currentId, byKeyboardArrow})
      this.myCurrentId = currentId;
      await this.OnInputChanged(currentId, byKeyboardArrow);
      if (this.autoCollapse && !byKeyboardArrow) {
        await this.doCollapse({ escaped: true });
      }
    },
    //-----------------------------------------------
    // Core Methods
    //-----------------------------------------------
    async doExtend(tryReload = true) {
      this.myOldValue = this.evalMyValue();
      // Try reload options again
      if (tryReload && _.isEmpty(this.myOptionsData)) {
        await this.reloadMyOptionData(true);
      }
      this.$nextTick(() => {
        this.myDropStatus = "extended";
      });
    },
    //-----------------------------------------------
    async doCollapse({ escaped = false } = {}) {
      if (escaped) {
        await this.evalMyItem(this.myOldValue);
      } else if (
        this.myFilterValue &&
        !_.isEqual(this.myFilterValue, this.myOldValue)
      ) {
        await this.evalMyItem(this.myFilterValue);
        this.tryNotifyChanged();
      }
      // Try notify
      else {
        this.tryNotifyChanged();
      }
      this.myDropStatus = "collapse";
      this.myOldValue = undefined;
      this.myFilterValue = null;
      this.myOptionsData = null;
    },
    //-----------------------------------------------
    tryNotifyChanged() {
      let val = this.evalMyValue();
      //console.log("tryNotifyChanged", val)
      if (Ti.Util.isNil(val) && Ti.Util.isNil(this.value)) return;
      if (!_.isEqual(val, this.value)) {
        this.$notify("change", val);
      }
    },
    //-----------------------------------------------
    // Utility
    //-----------------------------------------------
    evalMyValue(item = this.myItem, freeValue = this.myFreeValue) {
      //console.log("evalMyValue", item, freeValue)
      // Item
      if (item) {
        return this.Dict.getValue(item);
      }
      // Ignore free values
      return this.mustInList ? null : freeValue;
    },
    //-----------------------------------------------
    async evalMyItem(val = this.value) {
      //console.log("before evalMyItem", val)
      let it;
      if (this.Dict) {
        it = await this.Dict.getItem(val);
      }
      //console.log("after evalMyItem: it", it)
      if (_.isArray(it)) {
        console.error("!!!!!!! kao ~~~~~~~");
        it = null;
      }
      // Update state
      if (it) {
        let itV = this.Dict.getValue(it);
        this.myItem = it;
        this.myFreeValue = null;
        this.myCurrentId = itV;
        this.myCheckedIds = { [itV]: true };
      }
      // Clean
      else {
        this.myItem = null;
        this.myFreeValue = this.mustInList ? null : val;
        this.myCurrentId = null;
        this.myCheckedIds = {};
      }
    },
    //------------------------------------------------
    createDict() {
      // if (!_.isEmpty(this.dictVars)) {
      //   console.log("createDict in combo-input", this.dictVars)
      // }
      // Customized
      return Ti.DictFactory.CreateDictBy(this.options, {
        valueBy: this.valueBy,
        textBy: this.textBy,
        iconBy: this.iconBy,
        vars: this.dictVars,
        whenLoading: ({ loading }) => {
          this.loading = loading;
        }
      });
    },
    //-----------------------------------------------
    async reloadMyOptionData(force = false) {
      //console.log("reloadMyOptionData")
      let options = [];
      if (this.showCleanOption) {
        options.push({
          _is_clean: true,
          _row_display: [
            {
              key: "icon",
              defaultAs: "zmdi-close",
              comType: "TiIcon"
            },
            {
              key: "text",
              comType: "TiLabel",
              comConf: {
                hoverCopy: false,
                className: "as-tip"
              }
            }
          ],
          text: "i18n:clear",
          value: null
        });
      }
      if (force || this.isExtended) {
        let list = await this.Dict.queryData(this.myFilterValue);
        if (this.FnOptionFilter) {
          //console.log("do filter")
          let list2 = [];
          for (let i = 0; i < list.length; i++) {
            let li = list[i];
            let li2 = this.FnOptionFilter(li, i, list);
            if (!li2) {
              continue;
            }
            if (_.isBoolean(li2)) {
              list2.push(li);
            } else {
              list2.push(li2);
            }
          }
          list = list2;
        }
        options.push(...list);
      }
      this.myOptionsData = options;
      return this.myOptionsData;
    },
    //-----------------------------------------------
    // Callback
    //-----------------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-combo-multi-input", uniqKey)
      //....................................
      if ("ESCAPE" == uniqKey) {
        this.doCollapse({ escaped: true });
        return { prevent: true, stop: true, quit: true };
      }
      //....................................
      // If droplist is actived, should collapse it
      if ("ENTER" == uniqKey) {
        //if(this.$dropList && this.$dropList.isActived) {
        this.doCollapse();
        return { stop: true, quit: false };
        //}
      }
      //....................................
      if ("ARROWUP" == uniqKey) {
        if (this.$dropList) {
          this.$dropList.selectPrevRow({
            payload: { byKeyboardArrow: true }
          });
        }
        return { prevent: true, stop: true, quit: true };
      }
      //....................................
      if ("ARROWDOWN" == uniqKey) {
        if (this.$dropList && this.isExtended) {
          this.$dropList.selectNextRow({
            payload: { byKeyboardArrow: true }
          });
        } else {
          this.doExtend();
        }
        return { prevent: true, stop: true, quit: true };
      }
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    //-----------------------------------------------
    "value": {
      handler: function () {
        this.$nextTick(() => {
          this.evalMyItem();
        });
      },
      immediate: true
    },
    //-----------------------------------------------
    "myOptionsData": function () {
      this.$nextTick(() => {
        this.evalMyItem();
      });
    },
    //-----------------------------------------------
    "options": function (newval, oldval) {
      if (!_.isEqual(newval, oldval)) {
        this.myDict = this.createDict();
        this.myOptionsData = [];
        if (this.isExtended) {
          this.$nextTick(() => {
            this.reloadMyOptionData(true);
          });
        }
      }
    },
    //-----------------------------------------------
    "dictVars": function (newval, oldval) {
      if (!_.isEqual(newval, oldval)) {
        this.myDict = this.createDict();
        this.myOptionsData = [];
        if (this.isExtended) {
          this.$nextTick(() => {
            this.reloadMyOptionData(true);
          });
        }
      }
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  created: function () {
    this.debReload = _.debounce((val) => {
      this.reloadMyOptionData();
    }, this.delay);
  }
  ////////////////////////////////////////////////////
};
export default _M;
