const _M = {
  //////////////////////////////////////////////////////
  data: () => ({
    myRect: undefined,
    currentTabIndex: 0,
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
        "is-mode-tab": this.isTabMode,
        "has-title": this.hasTitle,
        "nil-title": !this.hasTitle,
        "has-footer": this.showFooterActions,
        "nil-footer": !this.showFooterActions,
        "has-aside": this.showSetupMenu,
        "nil-aside": !this.showSetupMenu
      }, `setup-menu-at-${this.setupMenuAt}`)
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
    FormMode() {
      return ({
        "flat": "flat",
        "all": "group",
        "group": "group",
        "tab": "tab"
      })[this.mode] || "group"
    },
    //--------------------------------------------------
    isFlatMode() { return 'flat' == this.FormMode },
    isGroupMode() { return 'group' == this.FormMode },
    isTabMode() { return 'tab' == this.FormMode },
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
    GridFieldNameMaxWidth() {
      // console.log("eval FieldNameWidth")
      return Ti.Util.selectValue(this.GridContext, this.fieldNameMaxWidth, {
        by: ([v, m], { width, lang }) => {
          if (!m || m == lang || width >= m) {
            return v
          }
        }
      })
    },
    //--------------------------------------------------
    GridColumnCount() {
      if (this.gridColumnHint >= 1) {
        return this.gridColumnHint
      }
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
      if (this.CurrentTabGroup) {
        return this.CurrentTabGroup.fields
      }
      return this.FormFields
    },
    //--------------------------------------------------
    CurrentTabGroup() {
      if (this.isTabMode) {
        for (let li of this.FormFields) {
          if (li.index == this.currentTabIndex) {
            return li
          }
        }
        return {}
      }
    },
    //--------------------------------------------------
    // add "current" to theTabList
    TabItems() {
      let items = []
      // let maxTabIndex = this.FormFields.length - 1
      // let currentIndex = Math.min(maxTabIndex, this.currentTabIndex)
      let currentIndex = this.currentTabIndex
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
        data: this.myData,
        status: this.fieldStatus,
        fieldBorder: this.fieldBorder,
        statusIcons: this.statusIcons,
        fieldNameMaxWidth: this.GridFieldNameMaxWidth,
        gridColumnCount: this.GridColumnCount,
      }
    },
    //--------------------------------------------------
    GridSetupMenu() {
      let items = []
      if (this.canCustomizedFields) {
        items.push(_.assign(
          {
            icon: "fas-tools",
            text: "i18n:setup-fields"
          },
          this.setupFieldsAction,
          {
            eventName: "form:setup:open"
          }
        ))
        items.push(_.assign(
          {
            icon: "zmdi-time-restore-setting",
            text: "i18n:setup-reset"
          },
          this.setupFieldsCleanAction,
          {
            eventName: "form:setup:clean",
            disabled: !this.hasCustomizedWhiteFields
          }
        ))
      }
      if (!_.isEmpty(items)) {
        if (this.setupMoreIcon) {
          return _.assign({
            items: [{
              icon: this.setupMoreIcon,
              items
            }]
          }, this.setupMenuConf)
        }
        return _.assign({
          items
        }, this.setupMenuConf)
      }
    },
    //--------------------------------------------------
    GridActionButtons() {
      let setup = []

      // Submit
      if (this.canSubmit) {
        setup.push(_.assign(
          {
            text: "i18n:submit"
          },
          this.submitButton,
          {
            eventName: "form:submit"
          }
        ))
      }

      // Confirm Change
      if (this.isFormNotifyConfirm) {
        // Edit
        if (this.isReadonly) {
          setup.push(_.assign(
            {
              text: "i18n:edit-content"
            },
            this.editButton,
            {
              eventName: "form:edit"
            }
          ))
        }
        // Confirm | Reset
        else {
          // Confirm
          setup.push(_.assign(
            {
              icon: "far-check-circle",
              text: "i18n:confirm-change"
            },
            this.confirmButton,
            {
              eventName: "form:confirm",
              disabled: !this.isFormDataChanged
            }
          ))
          // Reset
          setup.push(_.assign(
            {
              icon: "zmdi-time-restore",
              text: "i18n:cancel"
            },
            this.resetButton,
            {
              eventName: "form:reset"
            }
          ))
        }
      }


      // Others Customized action
      _.forEach(this.actionButtonSetup, a => setup.push(a))

      // Done
      if (!_.isEmpty(setup)) {
        return _.assign({
          className: "btn-r4",
          size: "tiny" == this.spacing ? "tiny" : "small",
          setup
        }, this.actionButtonConf)
      }
    },
    //--------------------------------------------------
    showSetupMenu() {
      return !_.isEmpty(this.GridSetupMenu)
    },
    //--------------------------------------------------
    showFooterActions() {
      return !_.isEmpty(this.GridActionButtons)
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  methods: {
    //--------------------------------------------------
    OnClickFormTop() {
      this.myActivedFieldKey = null
    },
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
    OnFormEdit() {
      this.myReadonly = false
    },
    //--------------------------------------------------
    OnFormConfirm() {
      //console.log("OnFormConfirm")
      let data = this.getData()
      this.$notify("change", data)
      this.myReadonly = this.readonly
    },
    //--------------------------------------------------
    OnFormReset() {
      this.myData = _.cloneDeep(this.data) || {}
      this.myReadonly = this.readonly
    },
    //--------------------------------------------------
    OnFormSubmit() {
      let data = this.getData()
      this.$notify("submit", data)
    },
    //--------------------------------------------------
    async OnFormSetupClean() {
      if (this.keepCustomizedTo) {
        let cuo = Ti.Storage.local.getObject(this.keepCustomizedTo)
        cuo.whiteFields = undefined
        Ti.Storage.local.setObject(this.keepCustomizedTo, cuo)
      }

      // Update the new field key
      this.evalFormBlackFieldList()
      this.evalFormWhiteFieldList()
      await this.evalFormFieldList()
    },
    //--------------------------------------------------
    async OnFormSetupOpen() {
      let cans = _.map(this.myCandidateFormFields, ({ race, key, title }) => {
        if ('Normal' == race) {
          return { text: title, value: key }
        }
      })
      let vals = []
      const _join_selected_fields = (fields = []) => {
        for (let fld of fields) {
          let { race, key, fields } = fld
          if ('Normal' == race) {
            vals.push(key)
          } else if ('Group' == race && !_.isEmpty(fields)) {
            _join_selected_fields(fields)
          }
        }
      }
      _join_selected_fields(this.myFormFields)

      // CleanUp
      cans = _.without(cans, undefined)
      vals = _.without(vals, undefined)

      // Show the dialog
      let whiteFields = await Ti.App.Open(_.assign(
        {
          title: "i18n:choose-fields",
          width: "6.4rem",
          height: "90%",
          position: "bottom"
        },
        this.customizeDialog,
        {
          result: vals,
          comType: "TiTransfer",
          comConf: {
            options: cans
          },
          components: [
            "@com:ti/transfer"
          ]
        }
      ))

      // User cancel
      if (!whiteFields) {
        return
      }

      // Store to local
      if (this.keepCustomizedTo) {
        let cuo = Ti.Storage.local.getObject(this.keepCustomizedTo)
        cuo.whiteFields = whiteFields
        Ti.Storage.local.setObject(this.keepCustomizedTo, cuo)
      }

      // Update the new field key
      this.evalFormWhiteFieldList(whiteFields)

      // Customized white list will cause prop.blackField be ignored
      this.myFieldBlackList = {}

      await this.evalFormFieldList()
    },
    //--------------------------------------------------
    restoreCurrentTabIndexFromLocal() {
      if (this.keepTabIndexBy) {
        this.currentTabIndex = Ti.Storage.session.getInt(
          this.keepTabIndexBy, 0
        )
      }
    },
    //--------------------------------------------------
    restoreCustomizedFromLocal() {
      let re = {
        whiteFields: undefined
      }
      if (this.keepCustomizedTo) {
        let cus = Ti.Storage.local.getObject(this.keepCustomizedTo)
        _.assign(re, cus)
      }
      return re
    },
    //--------------------------------------------------
    tryEvalData(newVal, oldVal) {
      if (!_.isEqual(newVal, oldVal)) {
        this.myData = _.cloneDeep(newVal) || {}
      }
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  watch: {
    "fields": "tryEvalFormFieldList",
    "data": {
      handler: "tryEvalData",
      immediate: true
    },
    "myData": "tryEvalFormFieldList",
    "isReadonly": "tryEvalFormFieldList",
    "myActivedFieldKey": "tryEvalFormFieldList"
  },
  //////////////////////////////////////////////////////
  created: function () {
    // Current tab
    this.restoreCurrentTabIndexFromLocal()

    // Curstomzed Setting
    let cus = this.restoreCustomizedFromLocal()
    // Customized white list will cause prop.blackField be ignored
    if (_.isEmpty(cus.whiteFields)) {
      this.evalFormBlackFieldList()
    }
    if (this.canCustomizedFields) {
      this.evalFormWhiteFieldList(cus.whiteFields)
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
    _.delay(() => {
      this.OnResize()
    })
    //...................................
    await this.evalFormFieldList()
  },
  ///////////////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////////////////
}
export default _M;