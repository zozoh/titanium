const _M = {
  //////////////////////////////////////////////////////
  data: () => ({
    myRect: undefined,
    currentTabIndex: 0
  }),
  //////////////////////////////////////////////////////
  computed: {
    //--------------------------------------------------
    TopClass() {
      return this.getTopClass([
        `as-spacing-${this.spacing || "comfy"}`,
        [`field-border-${this.fieldBorder}`]
      ], {
        "is-mode-flat": this.isFlatMode,
        "is-mode-group": this.isGroupMode,
        "is-mode-tab": this.isTabMode
      })
    },
    //--------------------------------------------------
    MainClass() {
      let className = []
      if (this.isTabMode) {
        className.push(
          `tab-at-${this.tabAt}`,
          `tab-at-${this.TheTabAtX}`,
          `tab-at-${this.TheTabAtY}`
        )
      }
      return Ti.Css.mergeClassName(className)
    },
    //--------------------------------------------------
    TabBodyStyle() {
      return Ti.Css.toStyle(this.tabBodyStyle)
    },
    //--------------------------------------------------
    hasTitle() {
      return this.title || this.icon ? true : false
    },
    //--------------------------------------------------
    hasData() {
      return !Ti.Util.isNil(this.data)
    },
    //--------------------------------------------------
    isFlatMode() { return 'flat' == this.mode },
    isGroupMode() { return 'group' == this.mode },
    isTabMode() { return 'tab' == this.mode },
    isAutoShowBlank() { return Ti.Util.fallback(this.autoShowBlank, false) },
    //--------------------------------------------------
    TheTabAt() { return this.tabAt.split("-") },
    TheTabAtX() { return this.TheTabAt[1] },
    TheTabAtY() { return this.TheTabAt[0] },
    //--------------------------------------------------
    GridContext() {
      // console.log("eval GridContext")
      return {
        ... (this.myRect || {}),
        screen: this.myScreenMode,
        lang: this.myLang,
      }
    },
    //--------------------------------------------------
    GridFieldNameWidth() {
      // console.log("eval FieldNameWidth")
      return Ti.Util.selectValue(this.GridContext, this.fieldNameWidth, {
        by: ([v, m], { width, lang }) => {
          if (!m || m == lang || width >= m) {
            return v
          }
        }
      })
    },
    //--------------------------------------------------
    GridColumnCount() {
      //console.log("eval GridColumnCount")
      return Ti.Util.selectValue(this.GridContext, this.gridColumnHint, {
        by: ([v, m], { width, screen }) => {
          if (!m || m == screen || width >= m) {
            return v
          }
        }
      })
    },
    //--------------------------------------------------
    FormFields() {
      if (this.isFlatMode) {
        return this.getFlattenFormFields(this.myFormFields)
      }
      if (this.isTabMode) {
        return this.getGroupedFormFields(this.myFormFields, "i18n:others")
      }
      return this.getGroupedFormFields(this.myFormFields)
    },
    //--------------------------------------------------
    GridFormFields() {
      if (this.isFlatMode) {
        return this.FormFields
      }
      if (this.isTabMode) {
        for (let li of this.FormFields) {
          if (li.index == this.currentTabIndex) {
            return li.fields
          }
        }
        return []
      }
      return this.FormFields
    },
    //--------------------------------------------------
    // add "current" to theTabList
    TabItems() {
      let items = []
      let maxTabIndex = this.FormFields.length - 1
      let currentIndex = Math.min(maxTabIndex, this.currentTabIndex)
      _.forEach(this.FormFields, (li, index) => {
        let isCurrent = (index == currentIndex)
        items.push(_.assign({}, li, {
          index, isCurrent, className: Ti.Css.mergeClassName({
            "is-current": isCurrent
          }, li.className)
        }))
      })
      return items
    },
    //--------------------------------------------------
    GridContainerConf() {
      return {
        data: this.data,
        status: this.fieldStatus,
        fieldBorder: this.fieldBorder,
        fieldNameWidth: this.GridFieldNameWidth,
        gridColumnCount: this.GridColumnCount,
      }
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  methods: {
    //--------------------------------------------------
    OnResize() {
      this.evalMyScreenMode()
      if (_.isElement(this.$el)) {
        this.myRect = Ti.Rects.createBy(this.$el)
      }
    },
    //--------------------------------------------------
    OnClickTab({ index }) {
      this.currentTabIndex = index
      if (this.keepTabIndexBy) {
        Ti.Storage.session.set(this.keepTabIndexBy, index)
      }
    },
    //--------------------------------------------------
    restoreCurrentTabIndexFromLocal() {
      if (this.keepTabIndexBy) {
        this.currentTabIndex = Ti.Storage.session.getInt(
          this.keepTabIndexBy, 0
        )
      }
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  watch: {
    "fields": "tryEvalFormFieldList",
    "data": "tryEvalFormFieldList",
    "myActivedFieldKey": "tryEvalFormFieldList"
  },
  //////////////////////////////////////////////////////
  created: function () {
    // Current tab
    this.restoreCurrentTabIndexFromLocal()
    // Lang
    this.evalMyLang()
    // Screen
    this.evalMyScreenMode()
  },
  //////////////////////////////////////////////////////
  mounted: async function () {
    Ti.Viewport.watch(this, {
      resize: () => {
        this.OnResize()
      }
    })
    this.OnResize()
    await this.evalFormFieldList()
  }
  //////////////////////////////////////////////////////
}
export default _M;