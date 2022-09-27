const _M = {
  //////////////////////////////////////////////////////
  data: () => ({
    // Save the changed data
    myData: {},

    myReadonly: undefined,
    myScreenMode: "desktop",

    myCandidateFormFields: [],

    myKeysInFields: [],
    myFormFields: [],
    myFormFieldMap: {},
    myActivedFieldKey: null,

    /*field white list*/
    myFieldWhiteList: {},
    /*field black list*/
    myFieldBlackList: {},

    /*auto conclude batch mode editable fields*/
    myBatchEditableFields: {},
    myForceEditableFields: {}
  }),
  //////////////////////////////////////////////////////
  computed: {
    //--------------------------------------------------
    isReadonly() {
      return Ti.Util.fallback(this.myReadonly, this.readonly, false)
    },
    //--------------------------------------------------
    isBatchMode() {
      return _.isArray(this.batchHint) && this.batchHint.length > 1
    },
    //--------------------------------------------------
    isIgnoreAutoReadonly() {
      if (_.isFunction(this.ignoreAutoReadonly)) {
        return this.ignoreAutoReadonly
      }
      if (_.isString(this.ignoreAutoReadonly)) {
        let reg = new RegExp(this.ignoreAutoReadonly)
        return ({ comType }) => {
          return reg.test(comType)
        }
      }
      return () => false
    },
    //--------------------------------------------------
    FormNotifyMode() {
      if ("auto" == this.notifyMode) {
        return this.isReadonly ? "none" : "immediate"
      }
      return this.notifyMode
    },
    //--------------------------------------------------
    isFormNotifyImmediate() { return "immediate" == this.FormNotifyMode },
    isFormNotifyConfirm() { return "confirm" == this.FormNotifyMode },
    isFormNotifyNone() { return "none" == this.FormNotifyMode },
    //--------------------------------------------------
    FormDataMode() {
      if ("auto" == this.dataMode) {
        return this.isFormNotifyConfirm ? "diff" : "all"
      }
      return this.dataMode
    },
    //--------------------------------------------------
    isFormDataModeDiff() { return "diff" == this.FormDataMode },
    isFormDataModeAll() { return "all" == this.FormDataMode },
    //--------------------------------------------------
    isFormReadonlyConfirm() {
      return this.readonly && this.isFormNotifyConfirm
    },
    //--------------------------------------------------
    FormData() {
      return this.filterData(this.myData)
    },
    //--------------------------------------------------
    isFormDataChanged() {
      return !_.isEmpty(this.getDiffData())
    },
    //--------------------------------------------------
    hasFieldWhiteList() {
      return !_.isEmpty(this.myFieldWhiteList)
    },
    //--------------------------------------------------
    hasFieldBlackList() {
      return !_.isEmpty(this.myFieldBlackList)
    },
    //--------------------------------------------------
    hasCustomizedWhiteFields() {
      if (!this.hasFieldWhiteList) {
        return false
      }
      let whites = Ti.Util.truthyKeys(this.myFieldWhiteList)
      return !_.isEqual(whites, this.whiteFields)
    },
    //--------------------------------------------------
    FormLinkFields() {
      let re = {}
      _.forEach(this.linkFields, (val, key) => {
        // By dict
        if (val && val.dict && val.target) {
          let { dict, target } = val
          // Guard
          if (!target) {
            return
          }
          // Get dict
          let { name, dynamic, dictKey } = Ti.DictFactory.explainDictName(dict)
          //.......................................................
          let getItemFromDict = async function (value, data) {
            let d;
            // Dynamic
            if (dynamic) {
              let key = _.get(data, dictKey)
              let vars = Ti.Util.explainObj(data, val.dictVars || {})
              d = Ti.DictFactory.GetDynamicDict({ name, key, vars })
            }
            // Static Dictionary
            else {
              d = Ti.DictFactory.CheckDict(name)
            }
            // Get item data
            if (d) {
              // Multi value
              if (_.isArray(value)) {
                let list = []
                for (let v of value) {
                  let v2 = await d.getItem(v)
                  list.push(v2)
                }
                return list
              }
              // Single value
              return await d.getItem(value)
            }
          }
          //.......................................................
          let fn;
          //.......................................................
          // Pick
          if (_.isArray(target)) {
            fn = async function ({ value }, data) {
              let it = await getItemFromDict(value, data)
              return _.pick(it, target)
            }
          }
          // Explain target
          else if (val.explainTargetAs) {
            fn = async function ({ value, name }, data) {
              let it = await getItemFromDict(value, data)
              let ctx = _.assign({}, data, {
                [val.explainTargetAs]: it
              })
              let newVal = Ti.Util.explainObj(ctx, target)
              // console.log(name, value, "->", newVal)
              return newVal
            }
          }
          // Simple Translate
          else {
            fn = async function ({ value }, data) {
              let it = await getItemFromDict(value, data)
              return Ti.Util.translate(it, target, v => Ti.Util.fallback(v, null))
            }
          }
          // join to map
          re[key] = fn
        }
        // Statice value
        else if (val && val.target) {
          re[key] = ({ name, value }, data) => {
            let tc = _.assign({}, { "$update": { name, value } }, data)
            if (val.test && !Ti.AutoMatch.test(val.test, tc)) {
              return
            }
            return Ti.Util.explainObj(tc, val.target)
          }
        }
        // Customized Function
        else if (_.isFunction(val)) {
          re[key] = val
        }
      })
      return re
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  methods: {
    //--------------------------------------------------
    async OnFieldChange({ name, value } = {}) {
      //console.log("OnFieldChange", name, value)
      //
      // Confirm, store the change to temp-data at first
      // whatever `confirm` or `immediate` we need the `myData`
      // switch to new version ASAP.
      // Then the GUI will keep show the new value, rather than
      // back to old version in a eywink.
      //
      // support name as ".." or [..]
      // Of cause, if name as `[..]`, the value must be a `{..}`
      //console.log("OnFieldChange", { name, value })
      let data = Ti.Types.toObjByPair({ name, value }, {
        dft: _.cloneDeep(this.myData)
      });
      let linkdedChanged = await this.applyLinkedFields({
        name, value, data
      });

      //
      // Notify change immediately
      //
      if (this.isFormNotifyImmediate) {
        // Notify at first
        //console.log("OnFieldChange", { name, value })
        this.$notify("field:change", { name, value })

        // Link fields
        _.forEach(linkdedChanged, (v, k) => {
          this.$notify("field:change", { name: k, value: v })
        })

        // Notify later ...
        // Wait for a tick to give a chance to parent of 'data' updating
        if (this.notifyDataImmediate) {
          this.$nextTick(() => {
            //console.log("notify data")
            let data = this.getData()
            this.$notify("change", data)
          })
        }
      }
      // Keep temp data
      else {
        this.myData = _.assign(data, linkdedChanged)
      }
    },
    //--------------------------------------------------
    async OnToggleForceEditable(fld) {
      let ids = _.cloneDeep(this.myForceEditableFields)
      if (ids[fld.uniqKey]) {
        delete ids[fld.uniqKey]
      } else {
        ids[fld.uniqKey] = true
      }
      this.myForceEditableFields = ids
      await this.evalFormFieldList()
    },
    //--------------------------------------------------
    //
    //           EVAL FORM DATA
    //
    //--------------------------------------------------
    getData() {
      if (this.isFormDataModeAll) {
        return _.cloneDeep(this.FormData) || {}
      }
      return this.getDiffData()
    },
    //--------------------------------------------------
    getDiffData() {
      let diff = {}
      _.forEach(this.myData, (v, k) => {
        let vOld = _.get(this.data, k)
        if (!_.isEqual(v, vOld)) {
          diff[k] = v
        }
      })
      return this.filterData(diff)
    },
    //--------------------------------------------------
    filterData(data = {}) {
      let re = data || {}
      if (this.onlyFields) {
        re = _.pick(re, this.myKeysInFields)
      }
      if (this.omitHiddenFields) {
        re = _.omitBy(re, (v, k) => {
          if (this.myFormFieldMap[k]) {
            return false
          }
          return true
        })
      }
      return re
    },
    //--------------------------------------------------
    //
    //           TIDY FORM FIELDS
    //
    //--------------------------------------------------
    getFlattenFormFields(fields = []) {
      let list = []
      const __join_fields = function (fields = []) {
        for (let fld of fields) {
          if ("Group" == fld.race || _.isArray(fld.fields)) {
            __join_fields(fld.fields)
          }
          // Join normal fields
          else {
            // Replace the last Label
            let lastFld = _.nth(list, -1)
            if (lastFld && "Label" == lastFld.race && "Label" == fld.race) {
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
        if (this.isGroup(fld)) {
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
    },
    //--------------------------------------------------
    //
    //           Apply linked fields
    //
    //--------------------------------------------------
    async applyLinkedFields({ name, value, data = {}, callback }) {
      let uniqKey = Ti.Util.anyKey(name)
      let linkFunc = this.FormLinkFields[uniqKey]

      // Guard
      if (!linkFunc) {
        return
      }

      let obj = await linkFunc({ name, value }, data)
      if (_.isFunction(callback) && !_.isEmpty(obj)) {
        callback(obj)
      }

      return obj;
    },
    //--------------------------------------------------
    //
    //           FORM FIELD WHITE/BLOCK LIST
    //
    //--------------------------------------------------
    __eval_form_filter_list(fields = []) {
      let re = {}
      _.forEach(fields, (k) => {
        re[k] = true
      })
      return re
    },
    evalFormWhiteFieldList(fields = this.whiteFields) {
      this.myFieldWhiteList = this.__eval_form_filter_list(fields)
    },
    evalFormBlackFieldList(fields = this.blackFields) {
      this.myFieldBlackList = this.__eval_form_filter_list(fields)
    },
    //--------------------------------------------------
    //
    //           EVAL FORM FIELDS
    //
    //--------------------------------------------------
    isGroup(fld) {
      return "Group" == fld.race || _.isArray(fld.fields)
    },
    //--------------------------------------------------
    isLabel(fld) {
      return "Label" == fld.race || !fld.name
    },
    //--------------------------------------------------
    isNormal(fld) {
      return "Normal" == fld.race || fld.name
    },
    //--------------------------------------------------
    async evalFormFieldList() {
      let list = []
      let cans = []
      let keys = []
      let fmap = {}
      //................................................
      if (_.isArray(this.fields)) {
        //console.log("async evalFormFieldList() x ", this.fields.length)
        for (let index = 0; index < this.fields.length; index++) {
          let fld = this.fields[index]
          let fld2 = await this.evalFormField(fld, [index], { cans, fmap })
          if (fld2) {
            list.push(fld2)
          }
          // Gather field names
          if (fld.name) {
            keys.push(..._.concat(fld.name))
          }
          // Join sub-group keys
          _.forEach(fld.fields, ({ name }) => {
            if (name) {
              keys.push(..._.concat(name))
            }
          })
        }
      }
      //................................................
      // Remove the adjacent Label fields
      let list2 = []
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        let next = _.nth(list, i + 1)
        if ('Label' == item.race) {
          if (!next || 'Label' == next.race) {
            continue;
          }
        }
        list2.push(item)
      }
      //................................................
      this.myKeysInFields = _.flattenDeep(keys)
      //................................................
      this.myFormFields = list2
      this.myFormFieldMap = fmap
      this.myCandidateFormFields = cans
    },
    //--------------------------------------------------
    async evalFormField(fld = {}, nbs = [], {
      cans = [], grp = this, fmap = {}
    } = {}) {
      // The key
      let fldKey = Ti.Util.anyKey(fld.name || nbs)

      // Visibility
      let { hidden, disabled } = Ti.Types.getFormFieldVisibility(fld, this.myData)

      //............................................
      let field;
      let omitKeys = ["hidden", "disabled", "enabled", "visible"]
      // For group
      if (this.isGroup(fld)) {
        let group = _.assign(_.omit(fld, omitKeys), {
          disabled,
          race: "Group",
          key: fldKey,
          fields: []
        })

        // Group fields
        if (_.isArray(fld.fields)) {
          for (let index = 0; index < fld.fields.length; index++) {
            let subfld = fld.fields[index]
            let newSubFld = await this.evalFormField(
              subfld,
              [...nbs, index],
              { cans, grp: group, fmap }
            );
            if (newSubFld) {
              group.fields.push(newSubFld)
            }
          }
        }
        // Done
        field = group
      }
      //............................................
      // Label
      else if (this.isLabel(fld)) {
        field = _.assign(_.omit(fld, omitKeys), {
          disabled,
          race: "Label",
          key: fldKey
        })
      }
      //............................................
      // For Normal Field
      else if (this.isNormal(fld)) {
        let comConf = _.cloneDeep(grp.defaultComConf) || {}
        field = _.defaults(_.omit(fld, omitKeys), {
          race: "Normal",
          key: fldKey,
          isActived: this.myActivedFieldKey == fldKey,
          type: this.defaultFieldType || "String",
          comType: grp.defaultComType || this.defaultComType || "TiLabel",
          comConf: {},
          disabled
        })
        _.defaults(field.comConf, comConf)

        // The UniqKey of field
        field.uniqKey = Ti.Util.anyKey(field.name)
        fmap[field.uniqKey] = field

        // Batch mode, auto disabled the un-editable fields
        if (this.isBatchMode && !field.disabled) {
          if (false === this.myBatchEditableFields[field.uniqKey]) {
            field.disabled = this.myForceEditableFields[field.uniqKey] ? false : true;
            field.batchDisabled = true
          }
        }

        // Default
        if (!field.serializer) {
          let fnName = Ti.Types.getFuncByType(field.type || "String", "serializer")
          field.serializer = `Ti.Types.${fnName}`
        }
        if (!field.transformer) {
          let fnName = Ti.Types.getFuncByType(field.type || "String", "transformer")
          field.transformer = `Ti.Types.${fnName}`
        }

        // Tidy form function
        field.serializer = Ti.Util.genInvoking(field.serializer, {
          context: this,
          args: fld.serialArgs,
          partial: "right"
        })
        field.transformer = Ti.Util.genInvoking(field.transformer, {
          context: this,
          args: fld.transArgs,
          partial: "right"
        })
        if (fld.required) {
          if (_.isBoolean(fld.required)) {
            field.required = true
          } else {
            field.required = Ti.AutoMatch.test(fld.required, this.myData)
          }
        }

        // Display Com
        field.com = await this.evalFieldCom(field, grp)

        // Layout style
        this.applyFieldDefault(field, grp)
      }
      //............................................
      // Panice
      else {
        throw "Invalid field: " + JSON.stringify(fld, null, '   ')
      }
      //............................................
      // Join to candidate
      cans.push(field)

      //............................................
      if ('Normal' == field.race) {
        // No-In White List
        if (this.hasFieldWhiteList) {
          if (!this.myFieldWhiteList[fldKey]) {
            return
          }
        }

        // In Black List
        if (this.hasFieldBlackList) {
          if (this.myFieldBlackList[fldKey]) {
            return
          }
        }
      }

      //............................................
      // Ignore hidden
      if (hidden) {
        return
      }

      //............................................
      // Ignore empty group
      if ('Group' == field.race) {
        if (_.isEmpty(field.fields)) {
          return
        }
      }

      // Done
      return field
    },
    //--------------------------------------------------
    applyFieldDefault(field, grp = this) {
      _.defaults(field, {
        "nameClass": grp.fieldNameClass || this.fieldNameClass,
        "nameStyle": grp.fieldNameStyle || this.fieldNameStyle,
        "nameAlign": grp.fieldNameAlign || this.fieldNameAlign,
        "nameVAlign": grp.fieldNameVAlign || this.fieldNameVAlign,
        "nameWrap": grp.fieldNameWrap || this.fieldNameWrap,
        "valueClass": grp.fieldValueClass || this.fieldValueClass,
        "valueStyle": grp.fieldValueStyle || this.fieldValueStyle,
        "valueWrap": grp.fieldValueWrap || this.fieldValueWrap,
        "rowSpan": grp.fieldRowSpan || this.fieldRowSpan,
        "colSpan": grp.fieldColSpan || this.fieldColSpan,
      })
    },
    //--------------------------------------------------
    async evalFieldCom(fld, grp) {
      let displayItem
      // UnActived try use display
      if (!fld.isActived || this.isReadonly) {
        displayItem = this.evalFieldDisplay(fld)
      }
      // Use default form component
      if (!displayItem) {
        displayItem = {
          key: fld.name,
          ... (_.omit(fld, "name", "key"))
        }
      }
      // Explain field com
      let com = await this.evalDataForFieldDisplayItem({
        itemData: this.myData,
        displayItem,
        vars: fld,
        autoIgnoreNil: false,
        autoIgnoreBlank: false,
        autoValue: fld.autoValue || "value"
      })
      // force set readonly
      if (this.isReadonly || fld.disabled) {
        _.assign(com.comConf, {
          readonly: true
        })
      }

      return com
    },
    //--------------------------------------------------
    evalFieldDisplay(field = {}) {
      let { name, display, comType, comConf } = field
      // Guard
      if (!display) {
        comType = _.upperFirst(_.camelCase(comType))
        // Auto gen display
        if (this.autoReadonlyDisplay
          && this.isReadonly
          && !this.isIgnoreAutoReadonly(field)
          && !/^(TiLabel|WnObjId)$/.test(comType)) {
          let labelConf = {}
          // If options
          if (comConf && comConf.options) {
            let dictName = Ti.DictFactory.DictReferName(comConf.options)
            if (dictName) {
              labelConf.dict = dictName
            }
            // Array to create dict instance
            else if (_.isArray(comConf.options)) {
              let dict = Ti.DictFactory.CreateDict({
                data: comConf.options
              })
              labelConf.dict = dict
            }
          }
          // If AMS
          if ("AMS" == field.type) {
            labelConf.format = comConf.format || Ti.DateTime.format
          }
          // Just pure value
          return {
            key: name,
            comType: "TiLabel",
            comConf: labelConf
          }
        }
        return
      }
      // Eval setting
      if (!_.isBoolean(display) && display) {
        // Call field_display.mjs
        return this.evalFieldDisplayItem(display, {
          defaultKey: name
        })
      }
      // return default.
      return {
        key: name,
        comType: "TiLabel",
        comConf: {}
      }
    },
    //--------------------------------------------------
    tryEvalFormFieldList(newVal, oldVal) {
      //console.log("tryEvalFormFieldList")
      if (!_.isEqual(newVal, oldVal)) {
        //console.log("  !! do this.evalFormFieldList()")
        this.evalBatchEditableFields()
        this.evalFormFieldList()
      }
    },
    //--------------------------------------------------
    evalBatchEditableFields() {
      // conclude each key hint
      let editables = {}
      let vals = {}    // Store the first appeared value
      let keys = {}    // Key of obj is equal
      if (this.isBatchMode) {
        for (let it of this.batchHint) {
          _.forEach(it, (v, k) => {
            // Already no equals
            if (false === keys[k]) {
              return
            }
            // Test val
            let v2 = vals[k]
            if (_.isUndefined(v2)) {
              vals[k] = v
              keys[k] = true
            }
            // Test
            else if (!_.isEqual(v, v2)) {
              keys[k] = false
            }
          })
        }
        // Join flat fields
        let fields = this.getFlattenFormFields(this.fields)
        //console.log("batch", this.isBatchMode, { keys, vals })
        // Update the batch editable fields
        for (let fld of fields) {
          // Ignore label
          if (!fld.name) {
            continue
          }

          let editable = true
          // Compose keys
          if (_.isArray(fld.name)) {
            for (let fldName of fld.name) {
              if (false === keys[fldName]) {
                editable = false
                break
              }
            }
          }
          // Simple key
          else {
            editable = false === keys[fld.name] ? false : true
          }
          let uniqKey = Ti.Util.anyKey(fld.name)
          editables[uniqKey] = editable
        }
      }
      //console.log("editables", editables)
      this.myBatchEditableFields = editables
    }
    //--------------------------------------------------
  }
  //////////////////////////////////////////////////////
}
export default _M;