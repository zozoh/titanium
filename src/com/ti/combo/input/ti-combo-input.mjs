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
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    isCollapse() { return "collapse" == this.myDropStatus },
    isExtended() { return "extended" == this.myDropStatus },
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    TheInputProps() {
      return _.assign({}, this, {
        readonly: !this.canInput || this.readonly,
        autoI18n: this.autoI18n,
        placeholder: this.placeholder,
        hover: this.hover,
        prefixIconForClean: this.prefixIconForClean,
        width: this.width,
        height: this.height
      })
    },
    //------------------------------------------------
    InputValue() {
      if (!Ti.Util.isNil(this.myFilterValue)) {
        return this.myFilterValue
      }
      if (this.myItem) {
        let text  = this.Dict.getText(this.myItem)
        let value = this.Dict.getValue(this.myItem)
        if(this.inputValueDisplay) {
          return Ti.Util.explainObj(this.myItem, this.inputValueDisplay, {
            evalFunc: true
          })
        }
        return text || value
      }
      return this.myFreeValue
    },
    //------------------------------------------------
    InputSuffixText() {
      if (this.myItem) {
        if(!_.isUndefined(this.inputSuffixTextDisplay)) {
          return Ti.Util.explainObj(this.myItem, this.inputSuffixTextDisplay, {
            evalFunc: true
          })
        }
        //return this.Dict.getValue(this.myItem)
      }
      return this.suffixText
    },
    //------------------------------------------------
    GetValueBy() {
      return it => this.Dict.getValue(it)
    },
    //------------------------------------------------
    ThePrefixIcon() {
      if (this.loading) {
        return "zmdi-settings zmdi-hc-spin"
      }
      let icon = this.prefixIcon;
      if (this.myItem) {
        icon = this.Dict.getIcon(this.myItem) || icon
      }
      return icon || "zmdi-minus"
    },
    //------------------------------------------------
    TheSuffixIcon() {
      return this.statusIcons[this.myDropStatus]
    },
    //------------------------------------------------
    DropComType() { return this.dropComType || "ti-list" },
    DropComConf() {
      return _.assign({
        display: this.dropDisplay || [
          "title|text|nm::flex-auto",
          "id|value::as-tip-block align-right"
        ],
        border: this.dropItemBorder
      }, this.dropComConf, {
        data: this.myOptionsData,
        currentId: this.myCurrentId,
        checkedIds: this.myCheckedIds,
        idBy: this.GetValueBy,
        multi: false,
        hoverable: true,
        checkable: false,
        autoCheckCurrent: true
      })
    },
    //------------------------------------------------
    Dict() {
      if (!this.myDict) {
        this.myDict = this.createDict()
      }
      return this.myDict
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //-----------------------------------------------
    OnDropListInit($dropList) { this.$dropList = $dropList },
    //------------------------------------------------
    OnCollapse() { this.doCollapse() },
    //-----------------------------------------------
    OnInputInputing(val) {
      if (this.filter) {
        this.myFilterValue = val
        // Auto extends
        if (this.autoFocusExtended) {
          if (!this.isExtended) {
            this.doExtend(false)
          }
        }
        // Reload options data
        if (this.isExtended) {
          this.debReload()
        }
      }
    },
    //-----------------------------------------------
    async OnInputChanged(val, byKeyboardArrow) {
      //console.log("haha")
      // Clean filter
      this.myFilterValue = null
      // Clean
      if (!val) {
        this.myItem = null
        this.myFreeValue = null
        this.myCheckedIds = {}
        this.myCurrentId = null
      }
      // Find ...
      else {
        let it = await this.Dict.getItem(val)
        // Matched tag
        if (it) {
          this.myItem = it
          this.myFreeValue = null
        }
        else if (!this.mustInList) {
          this.myItem = null
          this.myFreeValue = val
        }
      }
      if (!byKeyboardArrow)
        this.tryNotifyChanged()
    },
    //-----------------------------------------------
    async OnInputFocused() {
      if (this.autoFocusExtended && !this.isExtended) {
        await this.doExtend()
      }
    },
    //-----------------------------------------------
    async OnClickStatusIcon() {
      if (this.isExtended) {
        await this.doCollapse()
      } else {
        await this.doExtend()
      }
    },
    //-----------------------------------------------
    async OnDropListSelected({ currentId, byKeyboardArrow } = {}) {
      //console.log({currentId, byKeyboardArrow})
      this.myCurrentId = currentId
      await this.OnInputChanged(currentId, byKeyboardArrow)
      if (this.autoCollapse && !byKeyboardArrow) {
        await this.doCollapse({ escaped: true })
      }
    },
    //-----------------------------------------------
    // Core Methods
    //-----------------------------------------------
    async doExtend(tryReload = true) {
      this.myOldValue = this.evalMyValue()
      // Try reload options again
      if (tryReload && _.isEmpty(this.myOptionsData)) {
        await this.reloadMyOptionData(true)
      }
      this.$nextTick(() => {
        this.myDropStatus = "extended"
      })
    },
    //-----------------------------------------------
    async doCollapse({ escaped = false } = {}) {
      if (escaped) {
        this.evalMyItem(this.myOldValue)
      }
      // Try notify
      else {
        this.tryNotifyChanged()
      }
      this.myDropStatus = "collapse"
      this.myOldValue = undefined
    },
    //-----------------------------------------------
    tryNotifyChanged() {
      let val = this.evalMyValue()
      //console.log("tryNotifyChanged", val)
      if (Ti.Util.isNil(val) && Ti.Util.isNil(this.value))
        return
      if (!_.isEqual(val, this.value)) {
        this.$notify("change", val)
      }
    },
    //-----------------------------------------------
    // Utility
    //-----------------------------------------------
    evalMyValue(item = this.myItem, freeValue = this.myFreeValue) {
      //console.log("evalMyValue", item, freeValue)
      // Item
      if (item) {
        return this.Dict.getValue(item)
      }
      // Ignore free values
      return this.mustInList
        ? null
        : freeValue
    },
    //-----------------------------------------------
    async evalMyItem(val = this.value) {
      //console.log("before evalMyItem", val)
      let it = await this.Dict.getItem(val)
      //console.log("after evalMyItem: it", it)
      if (_.isArray(it)) {
        console.error("!!!!!!! kao ~~~~~~~")
        it = null
      }
      // Update state
      if (it) {
        let itV = this.Dict.getValue(it)
        this.myItem = it
        this.myFreeValue = null
        this.myCurrentId = itV
        this.myCheckedIds = { [itV]: true }
      }
      // Clean
      else {
        this.myItem = null
        this.myFreeValue = this.mustInList ? null : val
        this.myCurrentId = null
        this.myCheckedIds = {}
      }
    },
    //------------------------------------------------
    createDict() {
      //console.log("createDict in combo-input")
      // Customized
      if (this.options instanceof Ti.Dict) {
        return this.options
      }
      // Refer dict
      if (_.isString(this.options)) {
        let dictName = Ti.DictFactory.DictReferName(this.options)
        if (dictName) {
          let { name, dynamic, dictKey } = Ti.DictFactory.explainDictName(dictName)
          //
          // Dynamic dictionary
          //
          if (dynamic) {
            let key = _.get(this.dictVars, dictKey)
            if (!key) {
              return null
            }
            return Ti.DictFactory.GetDynamicDict({
              name, key,
              vars: this.dictVars
            }, ({ loading }) => {
              this.loading = loading
            })
          }
          return Ti.DictFactory.CheckDict(dictName, ({ loading }) => {
            this.loading = loading
          })
        }
      }
      // Auto Create
      return Ti.DictFactory.CreateDict({
        data: this.options,
        getValue: Ti.Util.genGetter(this.valueBy || "value"),
        getText: Ti.Util.genGetter(this.textBy || "text|name"),
        getIcon: Ti.Util.genGetter(this.iconBy || "icon")
      })
    },
    //-----------------------------------------------
    async reloadMyOptionData(force = false) {
      //console.log("reloadMyOptionData")
      if (force || this.isExtended) {
        let list = await this.Dict.queryData(this.myFilterValue)
        this.myOptionsData = list
      } else {
        this.myOptionsData = []
      }
      return this.myOptionsData
    },
    //-----------------------------------------------
    // Callback
    //-----------------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-combo-multi-input", uniqKey)
      //....................................
      if ("ESCAPE" == uniqKey) {
        this.doCollapse({ escaped: true })
        return { prevent: true, stop: true, quit: true }
      }
      //....................................
      // If droplist is actived, should collapse it
      if ("ENTER" == uniqKey) {
        //if(this.$dropList && this.$dropList.isActived) {
        this.doCollapse()
        return { stop: true, quit: false }
        //}
      }
      //....................................
      if ("ARROWUP" == uniqKey) {
        if (this.$dropList) {
          this.$dropList.selectPrevRow({
            payload: { byKeyboardArrow: true }
          })
        }
        return { prevent: true, stop: true, quit: true }
      }
      //....................................
      if ("ARROWDOWN" == uniqKey) {
        if (this.$dropList && this.isExtended) {
          this.$dropList.selectNextRow({
            payload: { byKeyboardArrow: true }
          })
        } else {
          this.doExtend()
        }
        return { prevent: true, stop: true, quit: true }
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
          this.evalMyItem()
        })
      },
      immediate: true
    },
    //-----------------------------------------------
    "myOptionsData": function () {
      this.$nextTick(() => {
        this.evalMyItem()
      })
    },
    //-----------------------------------------------
    "options": function (newval, oldval) {
      if (!_.isEqual(newval, oldval)) {
        this.myDict = this.createDict()
        this.myOptionsData = []
        if (this.isExtended) {
          this.$nextTick(() => {
            this.reloadMyOptionData(true)
          })
        }
      }
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  created: function () {
    this.debReload = _.debounce(val => {
      this.reloadMyOptionData()
    }, this.delay)
  }
  ////////////////////////////////////////////////////
}
export default _M;