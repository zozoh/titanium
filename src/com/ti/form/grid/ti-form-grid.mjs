const _M = {
  //////////////////////////////////////////////////////
  data: () => ({
    myLang: "zh-cn",
    myScreenMode: "desktop",

    myRect: undefined,
    currentTabIndex: 0
  }),
  //////////////////////////////////////////////////////
  computed: {
    //--------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-mode-flat": this.isFlatMode,
        "is-mode-group": this.isGroupMode,
        "is-mode-tab": this.isTabMode,
        [`tab-at-${this.tabAt}`]: this.isTabMode,
        [`tab-at-${this.TheTabAtX}`]: this.isTabMode,
        [`tab-at-${this.TheTabAtY}`]: this.isTabMode
      },
        `as-spacing-${this.spacing || "comfy"}`,
        `field-border-${this.fieldBorder}`
      )
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
    FieldNameWidth() {
      // console.log("eval FieldNameWidth")
      return Ti.Util.selectValue(this.GridContext, this.nameWidth, {
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
      return this.myFormFields
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
        fields: this.GridFormFields,
        data: this.data,
        status: this.fieldStatus,
        fieldBorder: this.fieldBorder,
        fieldNameWidth: this.FieldNameWidth,
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
    async OnFieldChange({ name, value } = {}) {
      // Notify at first
      //console.log("notify field", {name, value})
      this.$notify("field:change", { name, value })

      // Link fields
      let linkFunc = this.FormLinkFields[name]
      let obj;
      if (linkFunc) {
        obj = await linkFunc({ name, value }, this.data)
        if (!_.isEmpty(obj)) {
          _.forEach(obj, (v, k) => {
            this.$notify("field:change", { name: k, value: v })
          })
        }
      }

      // Notify later ...
      // Wait for a tick to give a chance to parent of 'data' updating
      this.$nextTick(() => {
        //console.log("notify data")
        let data = this.getData({ name, value })
        _.assign(data, obj)
        this.$notify("change", data)
      })
    },
    //--------------------------------------------------
    getFlattenFormFields(fields = []) {
      let list = []
      const __join_fields = function (fields = []) {
        for (let fld of fields) {
          if ("Group" == fld.type) {
            __join_fields(fld.fields)
          }
          // Join normal fields
          else {
            // Replace the last Label
            let lastFld = _.nth(list, -1)
            if (lastFld && "Label" == lastFld.type && "Label" == fld.type) {
              list[list.length - 1] = fld
            }
            // Join 
            else {
              list.push(fld)
            }
          }
        }
      }
      __join_fields(fields)
      return list
    },
    //--------------------------------------------------
    getGroupedFormFields(fields = [], otherGroupTitle) {
      let list = []
      let otherFields = []
      for (let fld of fields) {
        if (fld.type == "Group") {
          // Join others
          if (!_.isEmpty(otherFields)) {
            list.push({
              type: "Group",
              index: list.length,
              fields: otherFields
            })
            otherFields = []
          }
          // Join self
          list.push(_.assign({}, fld, {
            index: list.length
          }))
        }
        // Collect to others
        else {
          otherFields.push(fld)
        }
      }
      // Join others
      if (!_.isEmpty(otherFields)) {
        list.push({
          type: "Group",
          index: list.length,
          title: otherGroupTitle,
          fields: otherFields
        })
      }
      // Done
      return list;
    },
    //--------------------------------------------------
    evalMyScreenMode() {
      if ("auto" == this.screenMode) {
        let state = Ti.App(this).$state().viewport
        this.myScreenMode = _.get(state, "mode") || "desktop"
      } else {
        this.myScreenMode = this.screeMode
      }
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  watch: {
    "fields": "tryEvalFormFieldList",
    "data": "tryEvalFormFieldList",
    "myActivedFieldKey": "tryEvalFormFieldList",
  },
  //////////////////////////////////////////////////////
  created: function () {
    // Lang
    if ("auto" == this.lang) {
      this.myLang = _.kebabCase(Ti.Config.lang())
    } else {
      this.myLang = _.kebabCase(this.lang)
    }
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