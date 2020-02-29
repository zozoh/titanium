export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "myDropStatus"  : "collapse",
    "myCurrentItem" : null,
    "myInputing"    : null
  }),
  ////////////////////////////////////////////////////
  // props 
  props : {
    "options" : {
      type : Array,
      default : ()=>[]
    },
    "dropComType" : {
      type : String,
      default : "ti-list"
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    isCollapse() {return "collapse"==this.myDropStatus},
    isExtended() {return "extended"==this.myDropStatus},
    hasOptions() {return !_.isEmpty(this.options)},
    //------------------------------------------------
    theFormat() {
      return this.format || "${text}"
    },
    //------------------------------------------------
    theValueBy() {
      return this.valueBy || "value"
    },
    //------------------------------------------------
    theMatchBy() {
      return this.matchBy || ["text", "value"]
    },
    //------------------------------------------------
    theDropDisplay() {
      return this.dropDisplay || "text"
    },
    //------------------------------------------------
    getOptionItemValue() {
      if(_.isFunction(this.theValueBy)) {
        return it => this.theValueBy(it)
      }
      if(_.isString(this.theValueBy)) {
        return it => _.get(it, this.theValueBy)
      }
      return it => null
    },
    //------------------------------------------------
    isOptionItemMatched() {
      if(_.isFunction(this.theMatchBy)) {
        return (it, str)=>this.theMatchBy(it, str)
      }
      if(_.isString(this.theMatchBy)) {
        return (it, str)=>_.isEqual(it[this.theMatchBy], str)
      }
      if(_.isArray(this.theMatchBy)) {
        return (it, str)=>{
          for(let k of this.theMatchBy) {
            if(_.isEqual(it[k], str))
              return true
          }
          return false
        }
      }
      return (it, str)=>false
    },
    //------------------------------------------------
    theInputItem() {
      // Runtime value
      if(this.isExtended) {
        return this.myCurrentItem
       }
      // Find in list
      return this.findOptionItem(this.value)
    },
    //------------------------------------------------
    theInputValue() {
      if(!Ti.Util.isNil(this.myInputing)) {
        return this.myInputing
      }
      if(this.theInputItem) {
        return Ti.Types.toStr(this.theInputItem, this.theFormat)
      }
      if(!this.mustInList) {
        return this.value
      }
    },
    //------------------------------------------------
    thePlaceholder() {
      return this.placeholder || "i18n:empty"
    },
    //------------------------------------------------
    theInputFormat() {
      return this.format || "${text}"
    },
    //------------------------------------------------
    theSuffixIcon() {
      return this.statusIcons[this.myDropStatus]
    },
    //------------------------------------------------
    theDropCurrentId() {
      if(this.theInputValue) {
        return this.getOptionItemValue(this.theInputItem)
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onInputInit($input) {this.$input = $input},
    onListInit($list)   {this.$list  = $list},
    //-----------------------------------------------
    findOptionItem(str=null) {
      if(this.options && !Ti.Util.isNil(str)) {
        for(let it of this.options) {
          if(this.isOptionItemMatched(it, str)){
            return it
          }
        }
      }
      return null
    },
    //-----------------------------------------------
    doExtend() {
      this.myCurrentItem = this.theInputItem
      this.myDropStatus = "extended"
    },
    //-----------------------------------------------
    doCollapse() {
      // Apply the inputing
      if(!Ti.Util.isNil(this.myInputing)) {
        this.myCurrentItem = this.findOptionItem(this.myInputing)
      }
      // Find the new value
      let val = this.myCurrentItem
                  ? this.getOptionItemValue(this.myCurrentItem)
                  : this.myInputing
      
      // Reset status
      this.myDropStatus = "collapse"
      this.myInputing = null
      this.myCurrentItem = null

      // Actived Self
      this.$nextTick(()=>{
        this.setActived()
      })
      

      // Notify
      if(!_.isEqual(val, this.value)) {
        this.$emit("changed", val)
      }
    },
    //------------------------------------------------
    onInputInputing(val) {
      //console.log("inputing", val)
      this.myInputing = val
      this.myCurrentItem = this.findOptionItem(val)
      this.$emit("inputing", val)
    },
    //------------------------------------------------
    onInputFocused() {
      if(this.autoFocusExtended && !this.isExtended) {
        this.doExtend()
      }
    },
    //------------------------------------------------
    onInputChanged(val) {
      this.myInputing = val
      this.doCollapse()
    },
    //------------------------------------------------
    // onInputBlurred() {
    //   this.inputing = null
    // },
    //-----------------------------------------------
    onClickStatusIcon() {
      // extended -> collapse
      if(this.isExtended) {
        this.doCollapse()
      }
      // collapse -> extended
      else {
        this.doExtend()
      }
    },
    //-----------------------------------------------
    onListSelected({current, byKeyboardArrow}) {
      this.myCurrentItem = current
      // Auto collapse
      if(!byKeyboardArrow) {
        if(this.readonly || !this.canInput) {
          this.doCollapse()
        }
      }
    },
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-combo-input", uniqKey)
      //....................................
      if("ESCAPE" == uniqKey) {
        this.myInputing = null
        this.myCurrentItem = this.findOptionItem(this.value)
        this.doCollapse()
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
      if("ENTER" == uniqKey) {
        this.doCollapse()
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
      if("ARROWUP" == uniqKey) {
        if(this.$list) {
          this.$list.selectPrevRow({
            payload: {byKeyboardArrow: true}
          })
        }
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
      if("ARROWDOWN" == uniqKey) {
        if(this.$list && this.isExtended) {
          this.$list.selectNextRow({
            payload: {byKeyboardArrow: true}
          })
        } else {
          this.doExtend()
        }
        return {prevent:true, stop:true, quit:true}
      }
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "theInputItem" : function(){
      this.$emit("input:item", this.theInputItem)
    }
  }
  ////////////////////////////////////////////////////
}