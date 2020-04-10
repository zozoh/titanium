export default {
  //////////////////////////////////////////////////////
  model : {
    prop  : "data",
    event : "change"
  },
  //////////////////////////////////////////////////////
  data : ()=>({
    currentTabIndex : 0
  }),
  //////////////////////////////////////////////////////
  computed : {
    //--------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-tab-mode": this.isTabMode,
        "is-all-mode": this.isAllMode
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
    TheFields() {
      let list = []
      _.forEach(this.fields, (fld, index)=>{
        let fld2 = this.evalFormField(fld, [index])
        if(fld2) {
          list.push(fld2)
        }
      })
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
    FuncSet() {
      return _.assign({}, Ti.GlobalFuncs(), this.extendFunctionSet)
    },
    //--------------------------------------------------
    TheData() {
      return this.data || {}
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
      //console.log("ti-form.OnFieldChange", {name, value})      
      let data = _.cloneDeep(this.TheData)
      _.set(data, name, value)
      this.$notify("field:change", {name, value})
      this.$notify("change", data)
    },
    //--------------------------------------------------
    evalFormField(fld={}, nbs=[]) {
      // The key
      let fldKey = fld.name
        ? [].concat(fld.name).join("-")
        : "ti-fld-" + nbs.join("-")
      //............................................
      // For group
      if('Group' == fld.type) {
        let group = {
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
        return group
      }
      //............................................
      // For Normal Field
      if(fld.name) {
        let field = _.defaults(_.cloneDeep(fld), {
          type : "String",
          comType : this.defaultComType
        })

        // field status
        let fstKey = _.concat(field.name).join("-")
        let fldsta = _.get(this.fieldStatus, fstKey)
        if(status) {
          field.status  = fldsta.status
          field.message = fldsta.message
        }

        // Tidy form function
        field.serializer  = Ti.Types.getFuncBy(field, "serializer", this.FuncSet)
        field.transformer = Ti.Types.getFuncBy(field, "transformer", this.FuncSet)
        field.funcSet     = this.FuncSet

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
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  watch : {
    "fields" : function(){
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