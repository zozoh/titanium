const _M = {
  //////////////////////////////////////////////////////
  data: () => ({
    myKeysInFields: [],
    myFormFields: [],
    myFormFieldMap: {},
    myActivedFieldKey: null
  }),
  //////////////////////////////////////////////////////
  computed: {
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
            return Ti.Util.explainObj(data, val.target)
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
    //--------------------------------------
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
    //--------------------------------------
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
      let keys = []
      let fmap = {}
      //................................................
      if (_.isArray(this.fields)) {
        for (let index = 0; index < this.fields.length; index++) {
          let fld = this.fields[index]
          let fld2 = await this.evalFormField(fld, [index])
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
      this.myKeysInFields = _.flattenDeep(keys)
      //................................................
      this.myFormFields = list
      this.myFormFieldMap = fmap
    },
    //--------------------------------------------------
    async evalFormField(fld = {}, nbs = []) {
      // Get form field visibility
      let { hidden, disabled } = Ti.Types.getFormFieldVisibility(fld, this.data)
      if (hidden) {
        return
      }

      // let omitKeys
      let omitKeys = ["hidden", "disabled", "enabled", "visible"]

      // The key
      let fldKey = Ti.Util.anyKey(fld.name || nbs, "ti-fld")
      //............................................
      // For group
      if (this.isGroup(fld)) {
        let group = _.assign(_.omit(fld, omitKeys), {
          disabled,
          race: "Group",
          key: fldKey,
          fields: []
        })
        // Group fields
        _.forEach(fld.fields, (subfld, index) => {
          let newSubFld = this.evalFormField(subfld, [...nbs, index])
          if (newSubFld) {
            group.fields.push(newSubFld)
          }
        })
        // Done
        return _.isEmpty(group.fields) ? null : group
      }
      //............................................
      // Label
      if (this.isLabel(fld)) {
        return _.assign(_.omit(fld, omitKeys), {
          disabled,
          race: "Label",
          key: fldKey
        })
      }
      //............................................
      // For Normal Field
      if (this.isNormal(fld)) {
        let field = _.defaults(_.omit(fld, omitKeys), {
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

        // // field status
        // let fStatus = _.get(this.fieldStatus, funiqKey)
        // if(fStatus) {
        //   field.status  = fStatus.status
        //   field.message = fStatus.message
        // }

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

        // Done
        return field
      }
      // Panice
      throw "Invalid field: " + JSON.stringify(fld, null, '   ')
    },
    //--------------------------------------------------
    async evalFieldCom(fld) {
      let displayItem
      // UnActived try use display
      if (!fld.isActived) {
        displayItem = this.evalFieldDisplay(fld)
      }
      // Use default form component
      if (!displayItem) {
        displayItem = _.defaults(fld, {
          comType: "TiLabel"
        })
      }
      // Explain field com
      return await this.evalDataForFieldDisplayItem({
        itemData: this.data,
        displayItem,
        vars: fld,
        autoIgnoreNil: false,
        autoIgnoreBlank: false,
        autoValue: fld.autoValue
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
      if (!_.isEqual(newVal, oldVal)) {
        this.evalFormFieldList()
      }
    }
    //--------------------------------------------------
  }
  //////////////////////////////////////////////////////
}
export default _M;