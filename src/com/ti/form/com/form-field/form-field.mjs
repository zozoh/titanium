export default {
  inheritAttrs: false,
  //////////////////////////////////////////////
  data : ()=>({
    isComReady : false,
    theComType : null,
    theComConf : null
  }),
  //////////////////////////////////////////////
  computed : {
    //----------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-self-actived" : this.isSelfActived,
        "is-actived" : this.isActived,
        "no-status"  : !this.statusIcon
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
      let autoSize = "auto" == this.width
      let fullSize = "full" == this.width
      return {
        "is-size-auto"     : autoSize,
        "is-size-full"     : fullSize,
        "is-size-stretch"  : !autoSize && !fullSize && !Ti.Util.isNil(this.width),
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
    theDisplay() {
      // Guard
      if(!this.display) {
        return
      }
      // Eval setting
      if(!_.isBoolean(this.display) && this.display) {
        return this.evalFieldDisplayItem(this.display, {
          funcSet    : this.funcSet,
          defaultKey : this.name
        })
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
      if(this.isActived || !this.display) {
        dis = {
          comType : this.comType,
          comConf : this.comConf,
        }
      }

      // Assign the default value and return
      return _.defaults(_.cloneDeep(dis), {
        comType : "ti-label",
        key     : this.name,
        type    : this.type,
        dict    : this.dict,
        transformer : this.transformer
      })
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
      let theCom = await this.evalDataForFieldDisplayItem({
        itemData : this.data, 
        displayItem : this.theCurrentDisplayItem, 
        vars : {
          "isActived" : this.isActived
        },
        explainDict: this.explainDict,
        autoIgnoreNil : false
      })
      // console.log("evalTheCom", {
      //   myUID      : this._uid,
      //   isActived  : this.isActived,
      //   oldComType : this.theComType,
      //   oldComConf : _.cloneDeep(this.theComConf),
      //   newComType : theCom.comType,
      //   newComConf : _.cloneDeep(theCom.comConf),
      // })
      
      this.theComType = theCom.comType
      this.theComConf = theCom.comConf

      this.isComReady = true
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