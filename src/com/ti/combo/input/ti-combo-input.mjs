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
    },
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
    onInputKeyPress({uniqueKey}={}) {
      //console.log(uniqueKey)
      switch(uniqueKey) {
        //..................................
        // Escape: clear the runtime value
        case "ESCAPE": 
          this.myInputing = null
          this.doCollapse()
          break;
        //..................................
        // Enter: auto commit
        case "ENTER":
          this.doCollapse()
          break;
        //..................................
        case "ARROWUP":
          if(this.$list) {
            this.$list.selectPrevRow()
          }
          break
        //..................................
        case "ARROWDOWN":
          if(this.$list && this.isExtended) {
            this.$list.selectNextRow()
          } else {
            this.doExtend()
          }
          break
        //..................................
      }
    },
    //------------------------------------------------
    onInputFocused() {
      if(this.autoFocusExtended) {
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
      console.log("haha")
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
    onListSelected({current}) {
      this.myCurrentItem = current
      // Auto collapse
      if(this.readonly) {
        this.doCollapse()
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