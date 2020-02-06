export default {
  inheritAttrs: false,
  //////////////////////////////////////////////
  data : ()=>({
    theCom : null
  }),
  //////////////////////////////////////////////
  computed : {
    //----------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "no-status"  : !this.statusIcon,
        "is-actived" : this.isActived
      }, [
        `as-${this.viewportMode}`
      ], this.className)
    },
    //----------------------------------------
    isShowTitle () {return !Ti.Util.isNil(this.title)},
    isShowStatus() {return this.status ? true : false},
    isShowIcon  () {return !Ti.Util.isNil(this.icon)},
    isShowTip   () {return !Ti.Util.isNil(this.tip)},
    //----------------------------------------
    isNumberType() {
      return /^(Number|Integer|Float)$/.test(this.type)
    },
    //----------------------------------------
    theTitle() {
      if(this.title)
        return this.title
      if(_.isArray(this.name))
        return this.name.join("-")
      return this.name
    },
    //----------------------------------------
    comClass() {
      if(this.width && /^(auto|stretch)$/.test(this.width)) {
        return `is-size-${this.width}`
      }
    },
    //----------------------------------------
    comStyle() {
      if(this.width && !/^(auto|stretch)$/.test(this.width)) {
        return Ti.Css.toStyle({
          width : this.width
        })
      }
    },
    //----------------------------------------
    theFieldValue() {
      return Ti.Util.getOrPick(this.data, this.name)
    },
    //----------------------------------------
    theDisplay() {
      // Guard
      if(!this.display) {
        return
      }
      // Eval setting
      if(!_.isBoolean(this.display) && this.display) {
        return this.evalFieldDisplayItem(this.display, this.funcSet)
      }
      // return default.
      return {
        comType : "ti-label",
        comConf : {}
      }
    },
    //----------------------------------------
    theCurrentDisplayItem() {
      // Display Mode
      let dis = this.theDisplay || {}

      // If Actived reset the display
      if(this.isActived && this.comType) {
        dis = {}
      }

      // Assign the default value and return
      return _.defaults(_.cloneDeep(dis), {
        key     : this.name,
        type    : this.type,
        dict    : this.dict,
        comType : this.comType,
        comConf : this.comConf,
        transformer : this.transformer
      })
    },
    //----------------------------------------
    isComReady () {
      return this.theCom ? true : false
    },
    //----------------------------------------
    theComType() {
      return this.theCom ? this.theCom.comType : null
    },
    //----------------------------------------
    theComConf() {
      return this.theCom ? this.theCom.comConf : null
    },
    //----------------------------------------
    statusIcon() {
      if(this.statusIcons) {
        return this.statusIcons[this.status]
      }
    }
  },
  ////////////////////////////////////////////////
  methods : {
    //--------------------------------------------
    async evalTheCom() {
      this.theCom = await this.evalDataForFieldDisplayItem({
        itemData : this.data, 
        displayItem : this.theCurrentDisplayItem, 
        vars : {
          "isActived" : this.isActived
        },
        explainDict: this.explainDict,
        autoIgnoreNil : false
      })
    },
    //--------------------------------------------
    onChanged(val) {
      // Customized value
      let v2 = val
      try {
        //console.log("this.serializer(val):", val)
        v2 = this.serializer(val)
        //console.log("field changed", val, v2)
      }
      // Invalid 
      catch(error) {
        this.$emit("invalid", {
          errMessage : ""+error,
          name  : this.name,
          value : val
        })
        return
      }
      
      // apply default
      v2 = this.formatInputValue(v2)

      // emit event
      if(!this.checkEquals || !_.isEqual(v2, this.fieldValue)) {
        this.$emit("changed", {
          name  : this.name,
          value : v2
        })
      }
    },
    //--------------------------------------------
    formatInputValue(val) {
      // apply default
      if(_.isUndefined(val)){
        return _.cloneDeep(
          Ti.Util.fallback(this.undefinedAs, this.defaultAs)
        )
      }
      if(_.isNull(val)){
        return _.cloneDeep(
          Ti.Util.fallback(this.nullAs, this.defaultAs, null)
        )
      }
      if(this.isNumberType && isNaN(val)) {
        return _.cloneDeep(
          Ti.Util.fallback(this.nanAs, this.defaultAs, NaN)
        )
      }
      if(_.isEmpty(val) && _.isString(val)) {
        return _.cloneDeep(
          Ti.Util.fallback(this.emptyAs, this.defaultAs, "")
        )
      }
      return val
    },
    //--------------------------------------------
    __ti_shortcut(uniqKey) {
      console.log("ti-form", uniqKey)
      return false
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  watch : {
    "theCurrentDisplayItem" : function(){
      this.evalTheCom()
    },
    "data" : function() {
      this.evalTheCom()
    }
  },
  ////////////////////////////////////////////////
  mounted: function() {
    this.evalTheCom()
  }
  ////////////////////////////////////////////////
}