//////////////////////////////////////////////////
function normlizeFormField(vm, fld, nbs=[]) {
  let f2;
  // For group
  if('Group' == fld.type) {
    f2 = {
      className : fld.className,
      type  : "Group",
      icon  : fld.icon,
      title : fld.title,
      fields : []
    }
    // Recur ...
    for(let i=0; i<fld.fields.length; i++) {
      let subFld = fld.fields[i]
      let sub2 = normlizeFormField(vm, subFld, [...nbs, i])
      f2.fields.push(sub2)
    }
  }
  // Normal field
  else {
    f2 = _.cloneDeep(fld)
    f2.type = f2.type || "String"

    // field status
    let fstKey = [].concat(f2.name).join("-")
    let fst = vm.fieldStatus[fstKey]
    if(fst) {
      f2.status  = fst.status
      f2.message = fst.message
    }

    // Tidy form function
    f2.serializer  = Ti.Types.getFuncBy(f2, "serializer", vm.fnSet)
    f2.transformer = Ti.Types.getFuncBy(f2, "transformer", vm.fnSet)
  }
  // field key
  f2.key = fld.name 
            ? [].concat(fld.name).join("-")
            : "ti-fld-" + nbs.join("-")
  // return it
  return f2
}
//////////////////////////////////////////////////
const resize = function(evt){
  this.__debounce_adjust_fields_width()
}
//////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  //////////////////////////////////////////////////////
  data : ()=>({
    currentTabIndex : 0
  }),
  //////////////////////////////////////////////////////
  props : {
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
    "config" : {
      type : Object,
      default : ()=>({})
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
    //.......................................
    hasHeader() {
      return this.title || this.icon ? true : false
    },
    //.......................................
    topClass() {
      let spacing = this.config.spacing || "comfy"
      return Ti.Css.mergeClassName(
        this.className, {
          ["as-spacing-" + spacing] : true,
          "display-as-tab": this.isDisplayAsTab,
          "display-as-all": this.isDisplayAsAll
        })
    },
    //.......................................
    theFields() {
      let list = []
      if(_.isArray(this.config.fields)) {
        for(let i=0; i<this.config.fields.length; i++) {
          let fld = normlizeFormField(this, this.config.fields[i], [i])
          list.push(fld)
        }
      }
      return list
    },
    //.......................................
    isDisplayAsTab() {
      return 'tab' == this.display
    },
    //.......................................
    isDisplayAsAll() {
      return 'all' == (this.diaplay||"all")
    },
    //.......................................
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
    //.......................................
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
    //.......................................
    theCurrentTab() {
      for(let tab of this.theTabItems) {
        if(tab.isCurrent) {
          return tab
        }
      }
    },
    //.......................................
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
    //.......................................
    /***
     * Eval function set for `transformer|serializer` of each fields
     * 
     * Defaultly, it will support the function set defined in `Ti.Types`
     */
    fnSet() {
      return _.assign({}, Ti.Types, this.config.extendFunctionSet)
    },
    //.......................................
    formData() {
      return this.data || {}
    }
    //.......................................
  },
  //////////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    onClickTab(tab) {
      this.currentTabIndex = tab.index
      this.$emit("tab:changed", tab)
    },
    //----------------------------------------------
    onChanged(payload) {
      //console.log("------------------------ti-form changed", payload)
      this.$emit("changed", payload)
    },
    //----------------------------------------------
    onInvalid(err) {
      //console.log("invalid", err)
      this.$emit("invalid", err)
    },
    //----------------------------------------------
    __adjust_fields_width() {
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
    //----------------------------------------------
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
  mounted : function() {
    this.currentTabIndex = Ti.Storage.session.getInt(this.keepTabIndexBy, this.currentTab)
    Ti.Viewport.watch(this, {resize})
    this.$nextTick(()=>{
      this.__adjust_fields_width()
    })
  },
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////////////////
}