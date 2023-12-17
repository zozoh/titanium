const _M = {
  ////////////////////////////////////////////////////
  data: () => ({
    myDropStatus: "collapse",
    myTags: [],
    myFreeValues: [],
    myFilterValue: null,
    myOptionsData: [],
    myCurrentId: null,
    myCheckedIds: {},

    myOldValue: undefined,
    myDict: undefined,
    loading: false
  }),
  ////////////////////////////////////////////////////
  props: {
    "notifyWhenCollapse": {
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
    Values() {
      return Ti.S.toArray(this.value);
    },
    //------------------------------------------------
    InputTagValues() {
      return _.concat(this.myTags, this.myFreeValues);
    },
    //------------------------------------------------
    GetValueBy() {
      return (it) => this.Dict.getValue(it);
    },
    //------------------------------------------------
    TheSuffixIcon() {
      return this.statusIcons[this.myDropStatus];
    },
    //------------------------------------------------
    DropComType() {
      return this.dropComType || "ti-list";
    },
    DropComConf() {
      return _.assign(
        {
          display: this.dropDisplay || [
            "text|title|nm::flex-auto",
            "id|value::as-tip-block align-right"
          ],
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
          multi: true,
          hoverable: true,
          checkable: true,
          autoCheckCurrent: false
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
    //------------------------------------------------
    OnDropListInit($dropList) {
      this.$dropList = $dropList;
    },
    //------------------------------------------------
    async OnCollapse() {
      this.doCollapse();
    },
    //------------------------------------------------
    OnInputInputing(val) {
      if (this.filter) {
        this.myFilterValue = val;
        this.debReload();
      }
    },
    //------------------------------------------------
    async OnInputChanged(val) {
      // Clean filter
      this.myFilterValue = null;
      // Uniq
      if (this.valueUnique) {
        if (_.indexOf(this.myFreeValues, val) >= 0) {
          return;
        }
        for (let tag of this.myTags) {
          let tagV = this.Dict.getValue(tag);
          if (tagV == val) {
            return;
          }
        }
      }
      // Join to ...
      let it = await this.Dict.getItem(val);
      // Matched tag
      if (it) {
        this.myTags.push(it);
      }
      // Join to free value
      else if (val && !this.mustInList) {
        this.myFreeValues.push(val);
      }
      this.tryNotifyChanged();
    },
    //-----------------------------------------------
    async OnInputFocused() {
      //console.log("hahah");
      if (this.autoFocusExtended && !this.isExtended) {
        await this.doExtend();
      }
    },
    //-----------------------------------------------
    async OnTagListChanged(vals = []) {
      await this.evalMyTags(vals);
      this.tryNotifyChanged();
    },
    //-----------------------------------------------
    async OnClickStatusIcon() {
      if (this.isExtended) {
        this.doCollapse();
      } else {
        await this.doExtend();
      }
    },
    //-----------------------------------------------
    async OnDropListSelected({ currentId, checkedIds } = {}) {
      this.myCurrentId = currentId;
      this.myCheckedIds = checkedIds;

      let vals = Ti.Util.truthyKeys(checkedIds);
      await this.evalMyTags(_.concat(vals, this.myFreeValues));
      if (!this.notifyWhenCollapse) {
        this.tryNotifyChanged();
      }
    },
    //-----------------------------------------------
    // Core Methods
    //-----------------------------------------------
    async doExtend() {
      this.myOldValue = this.evalMyValues();
      // Try reload options again
      if (_.isEmpty(this.myOptionsData)) {
        await this.reloadMyOptionData(true);
      }
      this.$nextTick(() => {
        this.myDropStatus = "extended";
      });
    },
    //-----------------------------------------------
    doCollapse({ escaped = false } = {}) {
      if (escaped) {
        this.$notify("change", this.myOldValue);
      }
      if (this.notifyWhenCollapse) {
        this.tryNotifyChanged();
      }
      this.myDropStatus = "collapse";
      this.myOptionsData = [];
      this.myOldValue = undefined;
      this.myFilterValue = undefined;
    },
    //-----------------------------------------------
    tryNotifyChanged(escaped = false) {
      let vals = this.evalMyValues();
      if (!escaped && !_.isEqual(vals, this.Values)) {
        this.$notify("change", vals);
      }
    },
    //-----------------------------------------------
    // Utility
    //-----------------------------------------------
    evalMyValues(tags = this.myTags, freeValues = this.myFreeValues) {
      let vals = [];
      // Tags
      _.forEach(tags, (tag) => {
        let v = this.Dict.getValue(tag);
        if (!Ti.Util.isNil(v)) {
          vals.push(v);
        } else if (!this.mustInList) {
          vals.push(tag);
        }
      });
      // Ignore free values
      if (this.mustInList || _.isEmpty(freeValues)) {
        return vals;
      }
      // Join free values
      return _.concat(vals, freeValues);
    },
    //-----------------------------------------------
    async evalMyTags(vals = this.value) {
      vals = Ti.S.toArray(vals);
      let tags = [];
      let ids = {};
      let frees = [];
      for (let v of vals) {
        let tag = await this.Dict.getItem(v);
        if (tag) {
          tags.push(tag);
          ids[v] = true;
        } else {
          frees.push(v);
        }
      }
      this.myTags = tags;
      this.myFreeValues = frees;
      this.myCheckedIds = ids;
    },
    //------------------------------------------------
    createDict() {
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
      if (force || this.isExtended) {
        let list = await this.Dict.queryData(this.myFilterValue);
        if (this.FnOptionFilter) {
          //console.log("do filter")
          let list2 = [];
          for (let i = 0; i < list.length; i++) {
            let li = list[i];
            // console.log(i, li)
            let li2 = this.FnOptionFilter(li, {
              index: i,
              list,
              vars: this.optionVars
            });
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
      } else {
        this.myOptionsData = [];
      }
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
        if (this.$dropList && this.$dropList.isActived) {
          this.doCollapse();
          return { stop: true, quit: true };
        }
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
      handler: "evalMyTags",
      immediate: true
    },
    //-----------------------------------------------
    "options": function (newval, oldval) {
      //console.log("watch options");
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
