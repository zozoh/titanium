const _M = {
  //////////////////////////////////////////////////////
  model : {
    prop  : "data",
    event : "change"
  },
  //////////////////////////////////////////////////////
  data : ()=>({
    myKeysInFields: [],
    currentTabIndex : 0,
    isEvalMeasure : false,
    myFormFields : []
  }),
  //////////////////////////////////////////////////////
  computed : {
    //--------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-tab-mode": this.isTabMode,
        "is-all-mode": this.isAllMode,
        [`tab-at-${this.tabAt}`]  : this.isTabMode,
        [`tab-at-${this.TheTabAtX}`] : this.isTabMode,
        [`tab-at-${this.TheTabAtY}`] : this.isTabMode
      }, 
      `as-${this.ViewDisplayMode}`,
      `as-spacing-${this.spacing||"comfy"}`,
      `field-border-${this.fieldBorder}`
      )
    },
    //--------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height,
        visibility: this.isEvalMeasure ? "hidden" : "initial"
      })
    },
    //--------------------------------------------------
    ViewDisplayMode() {
      if(!this.screenMode || "auto" == this.screenMode) {
        return this.viewportMode || "desktop"
      }
      return this.screenMode
    },
    //--------------------------------------------------
    hasHeader() {
      return this.title || this.icon ? true : false
    },
    //--------------------------------------------------
    hasData() {
      return !Ti.Util.isNil(this.data)
    },
    //--------------------------------------------------
    isTabMode() {return 'tab' == this.mode},
    isAllMode() {return 'all' == (this.mode || "all")},
    isAutoShowBlank() {return Ti.Util.fallback(this.autoShowBlank, false)},
    //--------------------------------------------------
    TheTabAt() {return this.tabAt.split("-")},
    TheTabAtX(){return this.TheTabAt[1]},
    TheTabAtY(){return this.TheTabAt[0]},
    //--------------------------------------------------
    TabList() {
      let list = []
      let otherFields = []
      if(this.isTabMode) {
        for(let fld of this.myFormFields) {
          if(fld.type == "Group") {
            list.push(fld)
          }
          // Collect to others
          else {
            otherFields.push(fld)
          }
        }
        // Join others
        if(!_.isEmpty(otherFields)) {
          list.push({
            type : "Group",
            title : "i18n:others",
            fields : otherFields
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
      _.forEach(this.TabList, (li, index)=>{
        let isCurrent = (index == currentIndex)
        items.push(_.assign({}, li, {
          index, isCurrent, className: Ti.Css.mergeClassName({
            "is-current" : isCurrent
          }, li.className)
        }))
      })
      return items
    },
    //--------------------------------------------------
    CurrentTab() {
      for(let tab of this.TabItems) {
        if(tab.isCurrent) {
          return tab
        }
      }
    },
    //--------------------------------------------------
    FormBodyClass() {
      if(this.isTabMode && this.CurrentTab) {
        return Ti.Css.mergeClassName(
          this.bodyClass,
          `has-${this.FieldsInCurrentTab.length}-fields`,
          `tab-body-${this.CurrentTab.index}`,
          this.CurrentTab.className
        )
      }
      return Ti.Css.mergeClassName(
        this.bodyClass,
        `has-${this.FieldsInCurrentTab.length}-fields`
      )
    },
    //--------------------------------------------------
    FieldsInCurrentTab() {
      // Current Tab
      if(this.isTabMode) {
        if(this.CurrentTab) {
          return this.CurrentTab.fields || []
        }
        return []
      }
      // Show All
      else {
        return this.myFormFields
      }
    },
    //--------------------------------------------------
    FormLinkFields() {
      let re = {}
      _.forEach(this.linkFields, (val, key)=>{
        // By dict
        if(val && val.dict && val.target) {
          let {dict, target} = val
          // Guard
          if(!target) {
            return
          }
          // Get dict
          let {name, dynamic, dictKey} = Ti.DictFactory.explainDictName(dict)
          //.......................................................
          let getItemFromDict = async function(value, data) {
            let d;
            // Dynamic
            if(dynamic) {
              let key = _.get(data, dictKey)
              let vars = Ti.Util.explainObj(data, val.dictVars || {})
              d = Ti.DictFactory.GetDynamicDict({name, key, vars})
            }
            // Static Dictionary
            else {
              d = Ti.DictFactory.CheckDict(name)
            }
            // Get item data
            if(d) {
              // Multi value
              if(_.isArray(value)) {
                let list = []
                for(let v of value) {
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
          if(_.isArray(target)) {
            fn = async function({value}, data) {
              let it = await getItemFromDict(value, data)
              return _.pick(it, target)
            }
          }
          // Explain target
          else if(val.explainTargetAs) {
            fn = async function({value, name}, data) {
              let it = await getItemFromDict(value, data)
              let ctx = _.assign({}, data, {
                [val.explainTargetAs] : it
              })
              let newVal = Ti.Util.explainObj(ctx, target)
              //console.log(name, value, "->", newVal)
              return newVal
            }
          }
          // Simple Translate
          else {
            fn = async function({value}, data) {
              let it = await getItemFromDict(value, data)
              return Ti.Util.translate(it, target, v=>Ti.Util.fallback(v, null))
            }
          }
          // join to map
          re[key] = fn
        }
        // Statice value
        else if(val && val.target) {
          re[key] = ({name, value}, data)=>{
            if(val.test && !Ti.AutoMatch.test(val.test, data)) {
              return
            }
            return Ti.Util.explainObj(data, val.target)
          }
        }
        // Customized Function
        else if(_.isFunction(val)) {
          re[key] = val
        }
      })
      return re
    },
    //--------------------------------------------------
    /***
     * Eval function set for `transformer|serializer` of each fields
     * 
     * Defaultly, it will support the function set defined in `Ti.Types`
     */
    // FuncSet() {
    //   return _.assign({}, Ti.GlobalFuncs(), this.extendFunctionSet)
    // },
    //--------------------------------------------------
    TheData() {
      if(this.data) {
        if(this.onlyFields) {
          return _.pick(this.data, this.myKeysInFields)
        }
        return this.data
      }
      return {}
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  methods : {
    //--------------------------------------------------
    OnClickTab(tab) {
      this.isEvalMeasure = this.currentTabIndex!=tab.index
      this.currentTabIndex = tab.index
      this.$notify("tab:change", tab)
    },
    //--------------------------------------------------
    async OnFieldChange({name, value}={}) {
      // Notify at first
      //console.log("notify field", {name, value})
      this.$notify("field:change", {name, value})

      // Link fields
      let linkFunc = this.FormLinkFields[name]
      let obj;
      if(linkFunc) {
        obj = await linkFunc({name, value}, this.data)
        if(!_.isEmpty(obj)) {
          _.forEach(obj, (v,k)=>{
            this.$notify("field:change", {name:k, value:v})
          })
        }
      }

      // Notify later ...
      // Wait for a tick to give a chance to parent of 'data' updating
      this.$nextTick(()=>{
        //console.log("notify data")
        let data = this.getData({name, value})
        _.assign(data, obj)
        this.$notify("change", data)
      })
    },
    //--------------------------------------
    getData({name, value}={}) {
      let data = _.cloneDeep(this.TheData)

      // Signle value
      if(name && _.isString(name)) {
        // Whole data
        if(".." == name) {
          _.assign(data, value)
        }
        // Statci value
        else if(/^'[^']+'$/.test(name)) {
          return
        }
        // Dynamic value
        else {
          if(_.isUndefined(value)) {
            data = _.omit(data, name)
          } else if (name.startsWith(".")) {
            data[name] = value
          } else {
            _.set(data, name, value)
          }
        }
      }
      // Object
      else if(_.isArray(name)) {
        let omitKeys = []
        for(let k of name) {
          let v = _.get(value, k)
          if(_.isUndefined(v)) {
            omitKeys.push(k) 
          } else {
            _.set(data, k, v)
          }
        }
        if(omitKeys.length > 0) {
          data = _.omit(data, omitKeys)
        }
      }

      // Join the fixed data
      if(this.fixed) {
        _.assign(data, fixed)
      }
      return data
    },
    //--------------------------------------
    isGroup(fld) {
      return "Group" == fld.type || _.isArray(fld.fields)
    },
    //--------------------------------------------------
    isLabel(fld) {
      return "Label" == fld.type || !fld.name
    },
    //--------------------------------------------------
    evalFormFieldList() {
      let list = []
      let keys = []
      this.isEvalMeasure = true
      //................................................
      _.forEach(this.fields, (fld, index)=>{
        let fld2 = this.evalFormField(fld, [index])
        if(fld2) {
          list.push(fld2)
          // Gather keys
          if(!fld2.disabled) {
            // Field group ...
            if("Group" == fld2.type) {
              _.forEach(fld2.fields, ({disabled, name})=>{
                if(!disabled) {
                  keys.push(name)
                }
              })
            }
            // The fields
            else {
              keys.push(fld2.name)
            }
          }
        }
      })
      //................................................
      this.myKeysInFields = _.flattenDeep(keys)
      //................................................
      this.myFormFields = list
      //................................................
      this.__adjust_fields_width()
    },
    //--------------------------------------------------
    evalFormField(fld={}, nbs=[]) {
      // Hide or disabled
      if(fld.hidden) {
        if(Ti.AutoMatch.test(fld.hidden, this.data)) {
          return
        }
      }
      // Disable
      let disabled = false
      if(fld.disabled) {
        disabled = Ti.AutoMatch.test(fld.disabled, this.data)
      }

      // The key
      let fldKey = Ti.Util.anyKey(fld.name||nbs, "ti-fld")
      // let fldKey = fld.name
      //   ? [].concat(fld.name).join("-")
      //   : "ti-fld-" + nbs.join("-")
      //............................................
      // For group
      if(this.isGroup(fld)) {
        let group = {
          disabled,
          type        : "Group",
          key         : fldKey,
          className   : Ti.Css.mergeClassName(fld.className, this.defaultGroupClass),
          icon        : fld.icon,
          title       : fld.title,
          fields      : []
        }
        // Group fields
        _.forEach(fld.fields, (subfld, index)=>{
          let newSubFld = this.evalFormField(subfld, [...nbs, index])
          if(newSubFld) {
            group.fields.push(newSubFld)
          }
        })
        // Done
        return _.isEmpty(group.fields) ? null : group
      }
      //............................................
      // Label
      if(this.isLabel(fld)) {
        return {
          disabled,
          type        : "Label",
          key         : fldKey,
          className   : fld.className,
          icon        : fld.icon,
          title       : fld.title
        }
      }
      //............................................
      // For Normal Field
      if(fld.name) {
        let field = _.defaults(_.omit(fld, "disabled"), {
          type    : this.defaultFieldType || "String",
          comType : this.defaultComType   || "TiLabel",
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
        if(!field.serializer) {
          let fnName = Ti.Types.getFuncByType(field.type||"String", "serializer")
          field.serializer = `Ti.Types.${fnName}`
        }
        if(!field.transformer) {
          let fnName = Ti.Types.getFuncByType(field.type||"String", "transformer")
          field.transformer = `Ti.Types.${fnName}`
        }        

        // Tidy form function
        const invokeOpt = {
          context: this,
          partial: "right"
        }
        field.serializer  = Ti.Util.genInvoking(field.serializer, invokeOpt)
        field.transformer = Ti.Util.genInvoking(field.transformer,invokeOpt)

        // Done
        return field
      }
    },
    //--------------------------------------------------
    __adjust_fields_width() {
      // Guard
      if(!_.isElement(this.$el))
        return

      this.isEvalMeasure = true
      //console.log("__adjust_fields_width")
      //
      // Find the max width in all form
      //
      // Find all field-name Elements
      let $fldNames = Ti.Dom.findAll(".form-field > .field-name", this.$el)

      // Reset them to org-width
      for(let $fldnm of $fldNames) {
        Ti.Dom.setStyle($fldnm, {width:""})
      }

      // Get the max-width of them
      let maxWidth = 0
      for(let $fldnm of $fldNames) {
        let rect = Ti.Rects.createBy($fldnm)
        // If in vertical group
        let $pp = $fldnm.parentElement.parentElement.parentElement
        if(Ti.Dom.hasClass($pp, "form-group")
           && Ti.Dom.hasOneClass($pp, "as-columns", "as-vertical")
        ){
          let maxw = $pp.getAttribute("fld-name-max-width")*1 || 0
          maxw = Math.max(maxw, rect.width)
          $pp.setAttribute("fld-name-max-width", maxw)
        }
        // for whole form
        else {
          maxWidth = Math.ceil(Math.max(rect.width, maxWidth))
        }
      }



      // Wait for whole view rendered, and align the field-name
      for(let $fldnm of $fldNames) {
        // If in group
        let $pp = $fldnm.parentElement.parentElement.parentElement
        let maxw = $pp.getAttribute("fld-name-max-width")
        if(maxw) {
          Ti.Dom.setStyle($fldnm, {width:maxw*1})
        }
        // For whole form
        else {
          Ti.Dom.setStyle($fldnm, {width:maxWidth})
        }
      }

      this.$nextTick(()=>{
        this.isEvalMeasure = false
      })
    },
    //--------------------------------------------------
    adjustFieldsWidth() {
      if(this.adjustDelay > 0) {
        _.delay(()=>{
          this.__adjust_fields_width()
        }, this.adjustDelay)
      } else {
        this.$nextTick(()=>{
          this.__adjust_fields_width()
        })
      }
    },
    //--------------------------------------------------
    // Callback
    //--------------------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-form", uniqKey)
      if("ENTER" == uniqKey) {
        // It should wait a while before submit
        // <ti-input> will apply change at @change event
        // And the @change event will be fired when ENTER 
        // bubble fade away
        _.delay(()=>{
          this.$notify("submit")
        }, 100)
      }
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  watch : {
    "fields" : function(){
      this.evalFormFieldList();
    },
    "currentTab" : function(index){
      this.currentTabIndex = index
    },
    "currentTabIndex" : function(index){
      if(this.keepTabIndexBy) {
        Ti.Storage.session.set(this.keepTabIndexBy, index)
      }
      this.adjustFieldsWidth()
    }
  },
  //////////////////////////////////////////////////////
  created : function() {
    this.__debounce_adjust_fields_width = _.debounce(()=>{
      this.__adjust_fields_width()
    }, 500)
  },
  //////////////////////////////////////////////////////
  mounted : function() {
    //--------------------------------------------------
    this.currentTabIndex = 
      Ti.Storage.session.getInt(
          this.keepTabIndexBy, this.currentTab
      )
    //--------------------------------------------------
    Ti.Viewport.watch(this, {resize:()=>{
      this.__debounce_adjust_fields_width()
    }})
    //--------------------------------------------------
    this.evalFormFieldList();
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////////////////
}
export default _M;