const _M = {
  ////////////////////////////////////////////////////
  data: () => ({
    myRect: undefined,

    myDict: undefined,
    myOptionsData: [],
    myOptionsMap: {},
    loading: false,
  }),
  ////////////////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value": undefined,
    "options": {
      type: [String, Array, Function, Ti.Dict],
      default: () => [],
    },
    "optionMapping": {
      type: [Function, Object],
      default: undefined,
    },
    "optionFilter": {
      type: [Function, Object, Array],
      default: undefined,
    },
    // Item ignore by the AutoMatch
    "ignoreBy": undefined,
    /*
     {
       title : "title",
       key   : "key",
       items : "items"
     } 
     */
    "groupBy": {
      type: [Object, Function, Boolean],
      default: undefined,
    },
    "valueBy": {
      type: [String, Function],
      default: "value|id",
    },
    "textBy": {
      type: [String, Function],
      default: "text|name|title",
    },
    "iconeBy": {
      type: [String, Function],
      default: "icon",
    },
    //-----------------------------------
    // Behaviors
    //-----------------------------------
    // Default group title
    "title": {
      type: String,
    },
    "isBlank": {
      type: Boolean,
      default: false,
    },
    "otherEnabled": {
      type: Boolean,
      default: false,
    },
    "otherText": {
      type: String,
      default: "i18n:others",
    },
    "otherPlaceholder": {
      type: String,
      default: "i18n:no-set",
    },
    "otherInputWidth": {
      type: [String, Number],
    },
    "otherDefaultValue": {
      type: String,
      default: "",
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "groupStyle": {
      type: Object,
    },
    "itemsStyle": {
      type: Object,
    },
    "bulletIconOn": {
      type: String,
      default: "fas-check-circle",
    },
    "bulletIconOff": {
      type: String,
      default: "far-circle",
    },
    "autoI18n": {
      type: Boolean,
      default: true,
    },
    "defualItemIcon": {
      type: [Object, String],
      default: undefined,
    },
    "blankAs": {
      type: Object,
    },
    "gridColumnHint": {
      type: [Number, String, Array],
      // [[4,1200],[3,900],[2,600],1]
      default: 1,
    },
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass(
        {
          "as-grid": this.GridColumnCount > 1,
        },
        this.myTypeName
      );
    },
    //------------------------------------------------
    TopStyle() {},
    //-----------------------------------------------
    BlankLoadingConf() {
      return _.assign(
        {
          className: "nil-data as-big-mask",
          icon: "far-list-alt",
          text: "empty-data",
        },
        this.blankAs
      );
    },
    //-----------------------------------------------
    BulletGroupStyle() {
      let style = _.assign({}, this.groupStyle);
      return style;
    },
    //-----------------------------------------------
    BulletItemsStyle() {
      let style = _.assign({}, this.itemsStyle);
      if (this.GridColumnCount > 1) {
        _.assign(style, {
          "grid-template-columns": _.repeat("1fr ", this.GridColumnCount),
        });
      }
      return style;
    },
    // //--------------------------------------------------
    // GridContext() {
    //   // console.log("eval GridContext")
    //   return {
    //     ... (this.myRect || {}),
    //     screen: this.myScreenMode
    //   }
    // },
    // //--------------------------------------------------
    // GridColumnCount() {
    //   if (this.gridColumnHint >= 1) {
    //     return this.gridColumnHint
    //   }
    //   return Ti.Util.selectValue(this.GridContext, this.gridColumnHint, {
    //     by: ([v, m], { width, screen }) => {
    //       if (!m || m == screen || width >= m) {
    //         return v
    //       }
    //     }
    //   })
    // },
    //-----------------------------------------------
    FnOptionFilter() {
      if (_.isFunction(this.optionFilter)) {
        return this.optionFilter;
      }
      if (this.optionFilter) {
        return Ti.AutoMatch.parse(this.optionFilter);
      }
    },
    //-----------------------------------------------
    FnOptionMapping() {
      if (_.isFunction(this.optionMapping)) {
        return this.optionMapping;
      }
      if (this.optionMapping) {
        return (obj) => {
          return Ti.Util.translate(obj, this.optionMapping);
        };
      }
      return _.identity;
    },
    //-----------------------------------------------
    Grouping() {
      if (this.groupBy) {
        if (_.isFunction(this.groupBy)) {
          return this.groupBy;
        }
        if (_.isPlainObject(this.groupBy)) {
          return (obj) => {
            let title = _.get(obj, this.groupBy.title);
            let key = _.get(obj, this.groupBy.key);
            let items = _.get(obj, this.groupBy.items);
            if (key && !_.isEmpty(items)) {
              return { title, key, items };
            }
          };
        }
        return (obj) => _.pick(obj, "title", "key", "items");
      }
    },
    //-----------------------------------------------
    IgnoreItem() {
      if (this.ignoreBy) {
        return Ti.AutoMatch.parse(this.ignoreBy);
      }
      return () => false;
    },
    //-----------------------------------------------
    getItemIcon() {
      if (this.myDict) return (it) => this.myDict.getIcon(it);
      return Ti.Util.genGetterNotNil(this.iconBy);
    },
    getItemText() {
      if (this.myDict) return (it) => this.myDict.getText(it);
      return Ti.Util.genGetterNotNil(this.textBy);
    },
    getItemValue() {
      if (this.myDict) return (it) => this.myDict.getValue(it);
      return Ti.Util.genGetterNotNil(this.valueBy);
    },
    //------------------------------------------------
    hasItems() {
      return !_.isEmpty(this.ItemGroups);
    },
    //------------------------------------------------
    ItemGroups() {
      if (this.Grouping) {
        let list = [];
        for (let i = 0; i < this.myOptionsData.length; i++) {
          let data = this.myOptionsData[i];
          let { title, key, items } = this.Grouping(data);
          if (this.autoI18n) {
            title = Ti.I18n.text(title);
          }
          items = this.evalItems(items, i);
          list.push({
            key,
            index: i,
            title,
            checkMode: this.getItemsCheckMode(items),
            items,
          });
        }
        return list;
      }
      // Single Group
      else {
        let items = this.evalItems(this.myOptionsData, 0);
        console.log(items)
        return [
          {
            key: "g0",
            index: 0,
            title: this.autoI18n ? Ti.I18n.text(this.title) : this.title,
            checkMode: this.getItemsCheckMode(items),
            items,
          },
        ];
      }
    },
    //------------------------------------------------
    // If the value not in options, take it as others value
    OtherValue() {
      let itMap = this.myOptionsMap || {};
      // Grouped value
      if (_.isArray(this.value)) {
        let re = [];
        for (let v of this.value) {
          if (!itMap[v]) {
            re.push(v);
          }
        }
        return re.length > 1 ? re : _.first(re);
      }
      // Single value
      else if (!itMap[this.value]) {
        return this.value;
      }
    },
    //------------------------------------------------
    isOtherValue() {
      return !Ti.Util.isNil(this.OtherValue);
    },
    //------------------------------------------------
    OtherClassName() {
      return {
        "is-checked": this.isOtherValue,
      };
    },
    //------------------------------------------------
    OtherBulletIcon() {
      if (this.isOtherValue) {
        return this.bulletIconOn;
      }
      return this.bulletIconOff;
    },
    //------------------------------------------------
    OtherInputStyle() {
      return {
        width: Ti.Css.toSize(this.otherInputWidth),
      };
    },
    //--------------------------------------------------
    GridColumnCount() {
      return this.evalGridColumnCount(this.gridColumnHint);
    },
    //------------------------------------------------
  },

  ////////////////////////////////////////////////////
  methods: {
    //--------------------------------------------------
    OnResize() {
      if (_.isElement(this.$el)) {
        this.myRect = Ti.Rects.createBy(this.$el);
      }
    },
    //------------------------------------------------
    OnOtherInputChange($event) {
      let $input = $event.srcElement;
      let v = _.trim($input.value);
      this.tryNotifyChange(v);
    },
    //------------------------------------------------
    OnClickOther() {
      if (!this.isOtherValue) {
        this.tryNotifyChange(this.otherDefaultValue);
      }
    },
    //------------------------------------------------
    OnClickItem(it = {}) {
      if ("Option" == it.type) {
        this.OnClickOptionItem(it);
      }
    },
    //------------------------------------------------
    tryNotifyChange(value) {
      if (!_.isEqual(this.value, value)) {
        this.$notify("change", value);
      }
    },
    //--------------------------------------------------
    //
    //           Utility
    //
    //--------------------------------------------------
    evalGridColumnCount(columnHint, rect = this.myRect) {
      if (columnHint >= 1) {
        return columnHint;
      }
      //console.log("evalGridColumnCount", columnHint);
      return Ti.Util.selectValue(rect, columnHint, {
        by: ([v, m], { width, screen }) => {
          if (!m || m == screen || width >= m) {
            return v;
          }
        },
      });
    },
    //------------------------------------------------
    evalItems(items = [], groupIndex=0) {
      let itMap = {};
      let list = [];
      _.forEach(items, (li, index) => {
        if (this.IgnoreItem(li)) return;
        let it;
        // Pure value
        if (_.isString(li) || _.isNumber(li)) {
          it = {
            groupIndex,
            index,
            text: li,
            value: li,
          };
        }
        // Object
        else {
          it = {
            groupIndex,
            index,
            icon: this.getItemIcon(li),
            text: this.getItemText(li),
            value: this.getItemValue(li),
          };
        }
        // Mapping
        it = this.FnOptionMapping(it);
        _.defaults(it, {
          icon: this.defualItemIcon,
        });

        // Join value mapping
        itMap[it.value] = it;

        // I18n
        if (this.autoI18n) {
          it.text = Ti.I18n.text(it.text, it.text);
        }

        // Prepare the className
        it.className = {};

        // Eval type
        if (Ti.Util.isNil(it.value)) {
          it.type = "Label";
          it.className["as-label"] = true;
        } else {
          it.type = "Option";
          it.className["as-option"] = true;
        }

        // Mark check
        if (this.isItemChecked(it.value)) {
          it.className["is-checked"] = true;
          it.checked = true;
          it.bullet = this.bulletIconOn;
        } else {
          it.bullet = this.bulletIconOff;
          it.checked = false;
        }

        // Append to list
        list.push(it);
      });

      this.myOptionsMap = itMap;

      return list;
    },
    //------------------------------------------------
    createDict() {
      // Customized
      if (this.options instanceof Ti.Dict) {
        return this.options;
      }
      // Refer dict
      if (_.isString(this.options)) {
        let dictName = Ti.DictFactory.DictReferName(this.options);
        if (dictName) {
          return Ti.DictFactory.CheckDict(dictName, ({ loading }) => {
            this.loading = loading;
          });
        }
      }
      // Auto Create
      // return Ti.DictFactory.CreateDict({
      //   data : this.options,
      //   getValue : Ti.Util.genGetter(this.valueBy || "value|id"),
      //   getText  : Ti.Util.genGetter(this.textBy  || "text|name|title"),
      //   getIcon  : Ti.Util.genGetter(this.iconBy  || "icon")
      // })
    },
    //-----------------------------------------------
    async reloadMyOptionData() {
      this.myDict = this.createDict();

      let list;
      if (this.myDict) {
        this.loading = true;
        list = await this.myDict.getData();
      } else {
        list = this.options;
      }

      if (this.FnOptionFilter) {
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

      this.myOptionsData = list;

      this.$nextTick(() => {
        this.loading = false;
      });
    },
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "options": {
      handler: async function (newval, oldval) {
        if (!_.isEqual(newval, oldval)) {
          await this.reloadMyOptionData();
        }
      },
      immediate: true,
    },
  },
  //////////////////////////////////////////////////////
  mounted: async function () {
    Ti.Viewport.watch(this, {
      resize: () => {
        this.OnResize();
      },
    });
    this.$nextTick(() => {
      this.OnResize();
    });
  },
  ///////////////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Viewport.unwatch(this);
  },
  ////////////////////////////////////////////////////
};
export default _M;
