const _M = {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    myDropStatus   : "collapse",
    myItem         : null,
    myFreeValue    : null,
    myFilterValue  : null,
    myOptionsData  : [],
    myCurrentId    : null,
    myCheckedIds   : {},

    myOldValue : undefined,
    loading : false
  }),
  ////////////////////////////////////////////////////
  props : {
    "canInput" : {
      type : Boolean,
      default : true
    },
    "autoCollapse" : {
      type : Boolean,
      default : false
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    isCollapse() {return "collapse"==this.myDropStatus},
    isExtended() {return "extended"==this.myDropStatus},
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    TheInputProps(){
      return _.assign({}, this, {
        readonly : !this.canInput || this.readonly,
        autoI18n : this.autoI18n,
        placeholder : this.placeholder
      })
    },
    //------------------------------------------------
    InputValue() {
      if(!Ti.Util.isNil(this.myFilterValue)) {
        return this.myFilterValue
      }
      if(this.myItem) {
        return this.Dict.getText(this.myItem)
               || this.Dict.getValue(this.myItem)
      }
      return this.myFreeValue
    },
    //------------------------------------------------
    GetValueBy() {
      return it => this.Dict.getValue(it)
    },
    //------------------------------------------------
    ThePrefixIcon() {
      if(this.loading) {
        return "zmdi-settings zmdi-hc-spin"
      }
      let icon = this.prefixIcon;
      if(this.myItem) {
        icon = this.Dict.getIcon(this.myItem) || icon
      }
      return icon || "zmdi-minus"
    },
    //------------------------------------------------
    TheSuffixIcon() {
      return this.statusIcons[this.myDropStatus]
    },
    //------------------------------------------------
    DropComType() {return this.dropComType || "ti-list"},
    DropComConf() {
      return _.assign({
        display    : this.dropDisplay || "text",
        border     : this.dropItemBorder
      }, this.dropComConf, {
        data : this.myOptionsData,
        currentId  : this.myCurrentId,
        checkedIds : this.myCheckedIds,
        idBy       : this.GetValueBy,
        multi      : false,
        hoverable  : true,
        checkable  : false,
        autoCheckCurrent : true
      })
    },
    //------------------------------------------------
    Dict() {
      // Customized
      if(this.options instanceof Ti.Dict) {
        return this.options
      }
      // Refer dict
      if(_.isString(this.options)) {
        let dictName = Ti.DictFactory.DictReferName(this.options)
        if(dictName) {
          return Ti.DictFactory.CheckDict(dictName, ({loading}) => {
            this.loading = loading
          })
        }
      }
      // Auto Create
      return Ti.DictFactory.CreateDict({
        data : this.options,
        getValue : Ti.Util.genGetter(this.valueBy || "value"),
        getText  : Ti.Util.genGetter(this.textBy  || "text|name"),
        getIcon  : Ti.Util.genGetter(this.iconBy  || "icon")
      })
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    OnDropListInit($dropList){this.$dropList=$dropList},
    //------------------------------------------------
    OnCollapse() {this.doCollapse()},
    //-----------------------------------------------
    OnInputInputing(val) {
      if(this.filter) {
        this.myFilterValue = val
        // Auto extends
        if(this.autoFocusExtended) {
          if(!this.isExtended) {
            this.doExtend(false)
          }
        }
        // Reload options data
        if(this.isExtended) {
          this.debReload()
        }
      }
    },
    //-----------------------------------------------
    async OnInputChanged(val, byKeyboardArrow) {
      // Clean filter
      this.myFilterValue = null
      // Clean
      if(!val) {
        this.myItem = null
        this.myFreeValue = null
        this.myCheckedIds = {}
        this.myCurrentId = null
      }
      // Find ...
      else {
        let it = await this.Dict.getItem(val)
        // Matched tag
        if(it) {
          this.myItem = it
          this.myFreeValue = null
        }
        else if(!this.mustInList) {
          this.myItem = null
          this.myFreeValue = val
        }
      }
      if(!byKeyboardArrow)
        this.tryNotifyChanged()
    },
    //-----------------------------------------------
    async OnInputFocused() {
      if(this.autoFocusExtended && !this.isExtended) {
        await this.doExtend()
      }
    },
    //-----------------------------------------------
    async OnClickStatusIcon() {
      if(this.isExtended) {
        await this.doCollapse()
      } else {
        await this.doExtend()
      }
    },
    //-----------------------------------------------
    async OnDropListSelected({currentId, byKeyboardArrow}={}) {
      //console.log({currentId, byKeyboardArrow})
      this.myCurrentId = currentId
      this.OnInputChanged(currentId, byKeyboardArrow)
      if(this.autoCollapse && !byKeyboardArrow) {
        await this.doCollapse()
      }
    },
    //-----------------------------------------------
    // Core Methods
    //-----------------------------------------------
    async doExtend(tryReload=true) {
      this.myOldValue = this.evalMyValue()
      // Try reload options again
      if(tryReload && _.isEmpty(this.myOptionsData)) {
        await this.reloadMyOptionData(true)
      }
      this.$nextTick(()=>{
        this.myDropStatus = "extended"
      })
    },
    //-----------------------------------------------
    async doCollapse({escaped=false}={}) {
      if(escaped) {
        this.evalMyItem(this.myOldValue)
      }
      // Try notify
      else  {
        this.tryNotifyChanged()
      }
      this.myDropStatus = "collapse"
      this.myOldValue   = undefined
    },
    //-----------------------------------------------
    tryNotifyChanged() {
      let val = this.evalMyValue()
      if(!_.isEqual(val, this.value)) {
        this.$notify("change", val)
      }
    },
    //-----------------------------------------------
    // Utility
    //-----------------------------------------------
    evalMyValue(item=this.myItem, freeValue=this.myFreeValue) {
      //console.log("evalMyValue", item, freeValue)
      // Item
      if(item) {
        return this.Dict.getValue(item)
      }
      // Ignore free values
      return this.mustInList 
              ? null
              : freeValue
    },
    //-----------------------------------------------
    async evalMyItem(val=this.value) {
      let it = await this.Dict.getItem(val)
      if(it) {
        let itV = this.Dict.getValue(it)
        this.myItem = it
        this.myFreeValue = null
        this.myCurrentId  = itV
        this.myCheckedIds = {[itV]: true}
      }
      else if(!this.mustInList) {
        this.myItem = null
        this.myFreeValue = val
        this.myCurrentId  = null
        this.myCheckedIds = {}
      }
    },
    //-----------------------------------------------
    async reloadMyOptionData(force=false) {
      //console.log("reloadMyOptionData")
      if(force || this.isExtended) {
        this.myOptionsData = await this.Dict.queryData(this.myFilterValue)
      } else {
        this.myOptionsData = []
      }
    },
    //-----------------------------------------------
    // Callback
    //-----------------------------------------------
    __ti_shortcut(uniqKey) {
      //console.log("ti-combo-multi-input", uniqKey)
      //....................................
      if("ESCAPE" == uniqKey) {
        this.doCollapse({escaped:true})
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
      // If droplist is actived, should collapse it
      if("ENTER" == uniqKey) {
        if(this.$dropList && this.$dropList.isActived) {
          this.doCollapse()
          return {stop:true, quit:true}
        }
      }
      //....................................
      if("ARROWUP" == uniqKey) {
        if(this.$dropList) {
          this.$dropList.selectPrevRow({
            payload: {byKeyboardArrow: true}
          })
        }
        return {prevent:true, stop:true, quit:true}
      }
      //....................................
      if("ARROWDOWN" == uniqKey) {
        if(this.$dropList && this.isExtended) {
          this.$dropList.selectNextRow({
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
    //-----------------------------------------------
    "value" : {
      handler: "evalMyItem",
      immediate : true
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
   created : function() {
    this.debReload = _.debounce(val=>{
      this.reloadMyOptionData()
    }, this.delay)
  }
  ////////////////////////////////////////////////////
}
export default _M;