const _M = {
  ////////////////////////////////////////////////////
  /*
  {
    keyword: "xxx",  -> myFreeValue
    match: {..}      -> myFormData
  }
  */
  ////////////////////////////////////////////////////
  data : ()=>({
    myDropStatus : "collapse",
    myFreeValue : null,
    myFormData  : {}
  }),
  ////////////////////////////////////////////////////
  props : {
    "form" : {
      type : Object,
      default : null
    },
    "autoCollapse" : {
      type : Boolean,
      default : false
    },
    "statusIcons" : {
      type : Object,
      default : ()=>({
        collapse : "zmdi-chevron-down",
        extended : "zmdi-chevron-up"
      })
    },
    "autoFocusExtended": {
      type: Boolean,
      default: true
    },
    "spacing" : {
      type : String,
      default : "tiny",
      validator : v => /^(none|comfy|tiny)$/.test(v)
    },
    "dropWidth" : {
      type : [Number, String],
      default : "box"
    },
    "dropHeight" : {
      type : [Number, String],
      default : null
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass({
          "is-enabled": this.isFilterEnabled
        },`as-spacing-${this.spacing}`
      )
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.myDropStatus},
    isExtended() {return "extended"==this.myDropStatus},
    //------------------------------------------------
    hasForm() {
      return !_.isEmpty(this.form)
    },
    //------------------------------------------------
    isFilterEnabled() {
      return !_.isEmpty(this.myFreeValue)
        || !_.isEmpty(this.myFormData)
    },
    //------------------------------------------------
    TheInputProps(){
      return _.assign({}, this, {
        autoI18n : this.autoI18n,
        placeholder : this.placeholder
      })
    },
    //------------------------------------------------
    InputValue() {
      return this.myFreeValue
    },
    //------------------------------------------------
    ThePrefixIcon() {
      let icon = this.prefixIcon;
      return icon || "im-filter"
    },
    //------------------------------------------------
    TheSuffixIcon() {
      if(this.hasForm) {
        return this.statusIcons[this.myDropStatus]
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    OnCollapse() {this.doCollapse()},
    //-----------------------------------------------
    OnInputChanged(val) {
      this.myFreeValue = val
      this.myDropStatus = "collapse"

      // Clean all
      if(Ti.Util.isNil(val)) {
        this.myFormData  = {}
      }

      this.tryNotifyChanged()
    },
    //-----------------------------------------------
    OnInputFocused() {
      if(this.autoFocusExtended && !this.isExtended) {
        this.doExtend()
      }
    },
    //-----------------------------------------------
    OnClickStatusIcon() {
      if(this.isExtended) {
        this.doCollapse()
      } else {
        this.doExtend()
      }
    },
    //-----------------------------------------------
    OnFormChange(formData) {
      //console.log("filter form chanaged", formData)
      this.myFormData = formData
    },
    //-----------------------------------------------
    // Core Methods
    //-----------------------------------------------
    doExtend(tryReload=true) {
      if(this.hasForm && !this.isExtended) {
        this.myDropStatus = "extended"
      }
    },
    //-----------------------------------------------
    doCollapse({escaped=false}={}) {
      if(!this.isCollapse) {
        if(!escaped) {
          this.tryNotifyChanged()
        }
        this.myDropStatus = "collapse"
      }
    },
    //-----------------------------------------------
    tryNotifyChanged() {
      //console.log("tryNotifyChanged")
      let val = this.genValue()
      if(!_.isEqual(val, this.value)) {
        this.$notify("change", val)
      }
    },
    //-----------------------------------------------
    // Utility
    //-----------------------------------------------
    genValue() {
      return {
        keyword : this.myFreeValue,
        match   : this.myFormData
      }
    },
    //-----------------------------------------------
    evalMyValue() {
      let val = _.assign({}, this.value)
      this.myFreeValue = val.keyword
      this.myFormData  = val.match
    },
    //-----------------------------------------------
    // Callback
    //-----------------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-combo-filter", uniqKey)
      //....................................
      if("ESCAPE" == uniqKey) {
        this.doCollapse({escaped:true})
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
      if("ARROWDOWN" == uniqKey) {
        this.doExtend()
        return
      }
      //....................................
      if("ARROWUP" == uniqKey) {
        this.doCollapse()
        return
      }
      // //....................................
      // // If droplist is actived, should collapse it
      // if("ENTER" == uniqKey) {
      //   this.doCollapse()
      //   return {stop:true, quit:true}
      // }
      //....................................
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    //-----------------------------------------------
    "value" : {
      handler: "evalMyValue",
      immediate : true
    }
    //-----------------------------------------------
  }
  ////////////////////////////////////////////////////
}
export default _M;