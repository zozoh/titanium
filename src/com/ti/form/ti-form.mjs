const _M = {
  //////////////////////////////////////////////////////
  model : {
    prop  : "data",
    event : "change"
  },
  //////////////////////////////////////////////////////
  data : ()=>({
    myKeysInFields: [],
    currentTabIndex : 0
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
      `as-${this.viewportMode}`,
      `as-spacing-${this.spacing||"comfy"}`
      )
    },
    //--------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
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
    TheFields() {
      let list = []
      let keys = []
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
      return list
    },
    //--------------------------------------------------
    TabList() {
      let list = []
      let otherFields = []
      if(this.isTabMode) {
        for(let fld of this.TheFields) {
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
      _.forEach(this.TabList, (li, index)=>{
        let isCurrent = (index == this.currentTabIndex)
        items.push(_.assign({}, li, {
          index, isCurrent, className: {
            "is-current" : isCurrent
          }
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
        return this.TheFields
      }
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
      this.currentTabIndex = tab.index
      this.$notify("tab:change", tab)
    },
    //--------------------------------------------------
    OnFieldChange({name, value}={}) {
      // Notify at first
      //console.log("notify field")
      this.$notify("field:change", {name, value})

      // Notify later ...
      // Wait a tick, give the change parent
      // Update the data input
      // The computed field "TheField"
      // will auto-update the field status 'disabled/hidden'
      // It may change the notify data
      this.$nextTick(()=>{
        //console.log("notify data")
        let data = this.getData({name, value})
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
          _.set(data, name, value)
        }
      }
      // Object
      else if(_.isArray(name)) {
        let vo = {}
        for(let k of name) {
          vo[k] = _.get(value, k)
        }
        _.assign(data, vo)
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
    evalFormField(fld={}, nbs=[]) {
      // Hide or disabled
      if(fld.hidden) {
        if(Ti.Validate.match(this.data, fld.hidden)) {
          return
        }
      }
      // Disable
      let disabled = false
      if(fld.disabled) {
        disabled = Ti.Validate.match(this.data, fld.disabled)
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
          className   : fld.className,
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
      // For Normal Field
      if(fld.name) {
        let field = _.defaults(_.omit(fld, "disabled"), {
          type : "String",
          comType : this.defaultComType,
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
          partialRight: true
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
        maxWidth = Math.ceil(Math.max(rect.width, maxWidth))
      }

      // Wait for whole view rendered, and align the field-name
      for(let $fldnm of $fldNames) {
        Ti.Dom.setStyle($fldnm, {width:maxWidth})
      }
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
    "TheFields" : function(){
      this.adjustFieldsWidth()
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
    this.adjustFieldsWidth()
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////////////////
}
export default _M;