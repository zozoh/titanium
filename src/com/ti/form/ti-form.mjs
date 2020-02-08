export default {
  inheritAttrs : false,
  //////////////////////////////////////////////////////
  data : ()=>({
    currentTabIndex : 0
  }),
  //////////////////////////////////////////////////////
  props : {
    "className" : null,
    "icon" : {
      type : String,
      default : null
    },
    "title" : {
      type : String,
      default : null
    },
    "className" : {
      type : String,
      default : null
    },
    "display" : {
      type : String,
      default : "all",
      validator : (val)=>/^(all|tab)$/.test(val)
    },
    "currentTab" : {
      type : Number,
      default : 0
    },
    "keepTabIndexBy" : {
      type : String,
      default : null
    },
    "defaultComType" : {
      type : String,
      default : "ti-label"
    },
    "config" : {
      type : Object,
      default : ()=>({})
    },
    "explainDict" : {
      type : Function,
      default : _.identity
    },
    "data" : {
      type : Object,
      default : ()=>({})
    },
    // "status" : {
    //   type : Object,
    //   default : ()=>({
    //     "changed"   : false,
    //     "saving"    : false,
    //     "reloading" : false
    //   })
    // },
    "fieldStatus" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////////////////
  computed : {
    //--------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-self-actived" : this.isSelfActived,
        "is-actived" : this.isActived
      }, [
        `as-${this.viewportMode}`
      ], this.className)
    },
    //--------------------------------------------------
    hasHeader() {
      return this.title || this.icon ? true : false
    },
    //--------------------------------------------------
    topClass() {
      let spacing = this.config.spacing || "comfy"
      return Ti.Css.mergeClassName(
        this.className, {
          ["as-spacing-" + spacing] : true,
          "display-as-tab": this.isDisplayAsTab,
          "display-as-all": this.isDisplayAsAll
        })
    },
    //--------------------------------------------------
    theFields() {
      let list = []
      _.forEach(this.config.fields, (fld, index)=>{
        let fld2 = this.evalFormField(fld, [index])
        if(fld2) {
          list.push(fld2)
        }
      })
      return list
    },
    //--------------------------------------------------
    isDisplayAsTab() {
      return 'tab' == this.display
    },
    //--------------------------------------------------
    isDisplayAsAll() {
      return 'all' == (this.diaplay||"all")
    },
    //--------------------------------------------------
    theTabList() {
      let list = []
      let otherFields = []
      if(this.isDisplayAsTab) {
        for(let fld of this.theFields) {
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
    theTabItems() {
      let items = []
      _.forEach(this.theTabList, (li, index)=>{
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
    theCurrentTab() {
      for(let tab of this.theTabItems) {
        if(tab.isCurrent) {
          return tab
        }
      }
    },
    //--------------------------------------------------
    theFieldsInCurrentTab() {
      // Current Tab
      if(this.isDisplayAsTab) {
        if(this.theCurrentTab) {
          return this.theCurrentTab.fields || []
        }
        return []
      }
      // Show All
      else {
        return this.theFields
      }
    },
    //--------------------------------------------------
    /***
     * Eval function set for `transformer|serializer` of each fields
     * 
     * Defaultly, it will support the function set defined in `Ti.Types`
     */
    theFuncSet() {
      return _.assign({}, Ti.Types, this.config.extendFunctionSet)
    },
    //--------------------------------------------------
    formData() {
      return this.data || {}
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  methods : {
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
          fields      : [],
          explainDict : this.explainDict,
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
        field.serializer  = Ti.Types.getFuncBy(field, "serializer", this.theFuncSet)
        field.transformer = Ti.Types.getFuncBy(field, "transformer", this.theFuncSet)
        field.explainDict = this.explainDict
        field.funcSet     = this.theFuncSet

        // Done
        return field
      }
    },
    //--------------------------------------------------
    onClickTab(tab) {
      this.currentTabIndex = tab.index
      this.$emit("tab:changed", tab)
    },
    //--------------------------------------------------
    onChanged(payload) {
      //console.log("------------------------ti-form changed", payload)
      this.$emit("changed", payload)
    },
    //--------------------------------------------------
    onInvalid(err) {
      //console.log("invalid", err)
      this.$emit("invalid", err)
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
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  watch : {
    "config.fields" : function(){
      this.$nextTick(()=>{
        this.__adjust_fields_width()
      })
    },
    "currentTab" : function(index){
      this.currentTabIndex = index
    },
    "currentTabIndex" : function(index){
      if(this.keepTabIndexBy) {
        Ti.Storage.session.set(this.keepTabIndexBy, index)
      }
      this.$nextTick(()=>{
        this.__adjust_fields_width()
      })
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
    this.$nextTick(()=>{
      this.__adjust_fields_width()
    })
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////////////////
}