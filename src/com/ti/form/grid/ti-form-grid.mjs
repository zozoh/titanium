const _M = {
  //////////////////////////////////////////////////////
  data: () => ({
    myLang: undefined,
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
    TabList() {
      let list = []
      let otherFields = []
      if (this.isTabMode) {
        for (let fld of this.myFormFields) {
          if (fld.type == "Group") {
            list.push(fld)
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
            title: "i18n:others",
            fields: otherFields
          })
        }
      }
      return list;
    },
    //--------------------------------------------------
    // add "current" to theTabList
    TabItems() {
      let items = []
      let maxTabIndex = this.TabList.length - 1
      let currentIndex = Math.min(maxTabIndex, this.currentTabIndex)
      _.forEach(this.TabList, (li, index) => {
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
    FormFields() {
      if (this.isFlatMode) {
        return this.getFlattenFormFields(this.myFormFields)
      }
      if (this.isTabMode) {
        for (let li of this.TabItems) {
          if (li.isCurrent) {
            return li.fields
          }
        }
      }
      return this.myFormFields
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  methods: {
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
    if ("auto" == this.lang) {
      this.myLang = _.kebabCase(Ti.Config.lang())
    } else {
      this.myLang = _.kebabCase(this.lang)
    }
  },
  //////////////////////////////////////////////////////
  mounted: async function () {
    await this.evalFormFieldList()
  }
  //////////////////////////////////////////////////////
}
export default _M;