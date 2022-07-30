const _M = {
  //////////////////////////////////////////////////////
  data: () => ({
    myLang: "zh-cn",
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
  }),
  //////////////////////////////////////////////////////
  computed: {
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
              //console.log(name, value, "->", newVal)
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
    },
    //--------------------------------------------------
    FormData() {
      if (this.data) {
        let re = this.data
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
      }
      return {}
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  methods: {
    //--------------------------------------------------
    async OnFieldChange({ name, value } = {}) {
      // Notify at first
      //console.log("OnFieldChange", {name, value})
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
    //
    //           EVAL FORM DATA
    //
    //--------------------------------------------------
    getData({ name, value } = {}) {
      let data = _.cloneDeep(this.FormData)
      //console.log("GetData:", data)

      // Signle value
      if (name && _.isString(name)) {
        // Whole data
        if (".." == name) {
          _.assign(data, value)
        }
        // Statci value
        else if (/^'[^']+'$/.test(name)) {
          return
        }
        // Dynamic value
        else {
          if (_.isUndefined(value)) {
            data = _.omit(data, name)
          } else if (name.startsWith(".")) {
            data[name] = value
          } else {
            _.set(data, name, value)
          }
        }
      }
      // Object
      else if (_.isArray(name)) {
        let omitKeys = []
        for (let k of name) {
          let v = _.get(value, k)
          if (_.isUndefined(v)) {
            omitKeys.push(k)
          } else {
            _.set(data, k, v)
          }
        }
        if (omitKeys.length > 0) {
          data = _.omit(data, omitKeys)
        }
      }

      // Join the fixed data
      if (this.fixed) {
        _.assign(data, fixed)
      }
      return data
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
    evalMyLang() {
      if ("auto" == this.lang) {
        this.myLang = _.kebabCase(Ti.Config.lang())
      } else {
        this.myLang = _.kebabCase(this.lang)
      }
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
        for (let index = 0; index < this.fields.length; index++) {
          let fld = this.fields[index]
          let fld2 = await this.evalFormField(fld, [index], cans)
          if (fld2) {
            list.push(fld2)
            let fKeys = _.concat(fld2.name)
            for (let fk of fKeys) {
              fmap[fk] = fld2
            }
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
    async evalFormField(fld = {}, nbs = [], cans = [], grp = this) {
      // The key
      let fldKey = Ti.Util.anyKey(fld.name || nbs)

      // Visibility
      let { hidden, disabled } = Ti.Types.getFormFieldVisibility(fld, this.data)

      //............................................

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
              cans,
              group
            )
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
        field = _.defaults(_.omit(fld, omitKeys), {
          race: "Normal",
          key: fldKey,
          isActived: this.myActivedFieldKey == fldKey,
          type: this.defaultFieldType || "String",
          comType: this.defaultComType || "TiLabel",
          disabled
        })

        // The UniqKey of field
        field.uniqKey = _.concat(field.name).join("-")
        //console.log(field.uniqKey)

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
        const invokeOpt = {
          context: this,
          partial: "right"
        }
        field.serializer = Ti.Util.genInvoking(field.serializer, invokeOpt)
        field.transformer = Ti.Util.genInvoking(field.transformer, invokeOpt)
        if (fld.required) {
          if (_.isBoolean(fld.required)) {
            field.required = true
          } else {
            field.required = Ti.AutoMatch.test(fld.required, this.data)
          }
        }

        // Display Com
        field.com = await this.evalFieldCom(field)

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
    async evalFieldCom(fld) {
      //console.log("evalFieldCom", fld)
      let displayItem
      // UnActived try use display
      if (!fld.isActived) {
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
      return await this.evalDataForFieldDisplayItem({
        itemData: this.data,
        displayItem,
        vars: fld,
        autoIgnoreNil: false,
        autoIgnoreBlank: false,
        autoValue: fld.autoValue || "value"
      })
    },
    //--------------------------------------------------
    evalFieldDisplay({ name, display } = {}) {
      // Guard
      if (!display) {
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
        comType: "ti-label",
        comConf: {}
      }
    },
    //--------------------------------------------------
    tryEvalFormFieldList(newVal, oldVal) {
      //console.log("tryEvalFormFieldList")
      if (!_.isEqual(newVal, oldVal)) {
        //console.log("  !! do this.evalFormFieldList()")
        this.evalFormFieldList()
      }
    }
    //--------------------------------------------------
  }
  //////////////////////////////////////////////////////
}
export default _M;