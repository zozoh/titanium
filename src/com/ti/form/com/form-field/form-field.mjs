export default {
  inheritAttrs: false,
  //////////////////////////////////////////////
  data : ()=>({
    isComReady : false,
    myComType : null,
    myComConf : null
  }),
  //////////////////////////////////////////////
  computed : {
    //----------------------------------------
    TopClass() {
      return this.getTopClass({
        "no-status-icons"  : !this.hasStatusIcons,
        "has-status-icons" : this.hasStatusIcons
      }, 
      `as-${this.viewportMode}`,
      (this.StatusType?`is-${this.StatusType}`:null))
    },
    //----------------------------------------
    isShowTitle  () {return !Ti.Util.isNil(this.title)},
    isShowIcon   () {return !Ti.Util.isNil(this.icon)},
    isShowTip    () {return !Ti.Util.isNil(this.tip)},
    hasStatusIcons(){return !_.isEmpty(this.statusIcons)},
    //----------------------------------------
    isNumberType() {
      return /^(Number|Integer|Float)$/.test(this.type)
    },
    //----------------------------------------
    TheTitle() {
      if(this.title)
        return this.title
      if(_.isArray(this.name))
        return this.name.join("-")
      return this.name
    },
    //----------------------------------------
    ComClass() {
      let auto    = "auto" == this.width
      let full    = "full" == this.width
      let stretch = "stretch" == this.width
      let fixed   = !auto && !full && !stretch && !Ti.Util.isNil(this.width)
      return {
        "is-size-auto"     : auto,
        "is-size-full"     : full,
        "is-size-stretch"  : stretch,
        "is-size-fixed"    : fixed
      }
    },
    //----------------------------------------
    ComStyle() {
      if(this.width && !/^(auto|stretch)$/.test(this.width)) {
        return Ti.Css.toStyle({
          width : this.width
        })
      }
    },
    //----------------------------------------
    TheDisplay() {
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
    CurrentDisplayItem() {
      // Display Mode
      let dis = this.TheDisplay || {}

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
    Status() {
      let fstKey = _.concat(this.name).join("-")
      return _.get(this.fieldStatus, fstKey)
    },
    //----------------------------------------
    StatusType() {
      return _.get(this.Status, "type")
    },
    //----------------------------------------
    StatusText() {
      return _.get(this.Status, "text")
    },
    //----------------------------------------
    StatusIcon() {
      if(this.Status && this.hasStatusIcons) {
        return this.statusIcons[this.Status.type]
      }
    },
    //----------------------------------------
  },
  ////////////////////////////////////////////////
  methods : {
    //--------------------------------------------
    async evalTheCom() {
      console.log(this.data, this.CurrentDisplayItem)
      let theCom = await this.evalDataForFieldDisplayItem({
        itemData : this.data, 
        displayItem : this.CurrentDisplayItem, 
        vars : {
          "isActived" : this.isActived
        },
        autoIgnoreNil : false
      })
      // console.log("evalTheCom", {
      //   myUID      : this._uid,
      //   isActived  : this.isActived,
      //   oldComType : this.myComType,
      //   oldComConf : _.cloneDeep(this.myComConf),
      //   newComType : theCom.comType,
      //   newComConf : _.cloneDeep(theCom.comConf),
      // })
      
      this.myComType = theCom.comType
      this.myComConf = theCom.comConf

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
        this.$emit("change", {
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
    "CurrentDisplayItem" : function(){
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