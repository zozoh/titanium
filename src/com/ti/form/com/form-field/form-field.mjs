const _M = {
  //////////////////////////////////////////////
  data: () => ({
    isComReady: false,
    myComType: null,
    myComConf: null
  }),
  //////////////////////////////////////////////
  computed: {
    //----------------------------------------
    TopClass() {
      return this.getTopClass({
        "no-status-icons": !this.hasStatusIcons,
        "has-status-icons": this.hasStatusIcons,
        "is-disabled": this.disabled
      },
        //`as-${this.screenMode}`,
        (this.StatusType ? `is-${this.StatusType}` : null))
    },
    //----------------------------------------
    isShowTitle() { return !Ti.Util.isNil(this.title) },
    isShowIcon() { return !Ti.Util.isNil(this.icon) },
    isShowTip() { return !Ti.Util.isNil(this.tip) },
    hasStatusIcons() { return !_.isEmpty(this.statusIcons) },
    //----------------------------------------
    isNumberType() {
      return /^(Number|Integer|Float)$/.test(this.type)
    },
    //----------------------------------------
    UniqName() {
      return _.isArray(this.name)
        ? this.name.join("-")
        : this.name
    },
    //----------------------------------------
    TheTitle() {
      return this.title || this.UniqName
    },
    //----------------------------------------
    ComClass() {
      let auto = "auto" == this.width
      let full = "full" == this.width
      let stretch = "stretch" == this.width
      let fixed = !auto && !full && !stretch && !Ti.Util.isNil(this.width)
      return {
        "is-size-auto": auto,
        "is-size-full": full,
        "is-size-stretch": stretch,
        "is-size-fixed": fixed
      }
    },
    //----------------------------------------
    ConStyle() {
      return Ti.Css.toStyle({
        height: this.height,
        width: this.fieldWidth
      })
    },
    //----------------------------------------
    ComStyle() {
      let css = {
        height: this.height
      }
      if (this.width && !/^(auto|stretch)$/.test(this.width)) {
        css.width = Ti.Css.toSize(this.width)
      }
      return Ti.Css.toStyle(css)
    },
    //----------------------------------------
    TheDisplay() {
      // Guard
      if (!this.display) {
        return
      }
      // Eval setting
      if (!_.isBoolean(this.display) && this.display) {
        return this.evalFieldDisplayItem(this.display, {
          //funcSet    : this.funcSet,
          defaultKey: this.name
        })
      }
      // return default.
      return {
        comType: "ti-label",
        comConf: {}
      }
    },
    //----------------------------------------
    CurrentDisplayItem() {
      // Display Mode
      let dis = this.TheDisplay || {}

      // If Actived reset the display
      if (this.isActived || !this.display) {
        dis = {
          defaultAs: this.defaultAs,
          comType: this.comType,
          comConf: this.comConf,
        }
      }

      // Assign the default value and return
      return _.defaults(_.cloneDeep(dis), {
        comType: "ti-label",
        key: this.name,
        type: this.type,
        dict: this.dict,
        transformer: this.transformer
      })
    },
    //----------------------------------------
    Status() {
      return _.get(this.fieldStatus, this.uniqKey)
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
      if (this.Status && this.hasStatusIcons) {
        return this.statusIcons[this.Status.type]
      }
    },
    //----------------------------------------
  },
  ////////////////////////////////////////////////
  methods: {
    //--------------------------------------------
    __before_bubble({ name, args }) {
      if (this.name) {
        return {
          name: `${this.UniqName}::${name}`,
          args
        }
      }
    },
    //--------------------------------------------
    OnChange(val) {
      // apply default
      let v2 = this.evalInputValue(val)

      try {
        // console.log("this.serializer(val):", v2)
        v2 = this.serializer(v2)
        // console.log("field changed", val, v2)
      }
      // Invalid 
      catch (error) {
        this.$notify("invalid", {
          errMessage: "" + error,
          name: this.name,
          value: val
        })
        return
      }

      // apply default
      v2 = this.evalInputValue(v2)

      // Com Value
      let comValue = _.get(this.myComConf, this.autoValue)

      // emit event
      if (!this.checkEquals || !_.isEqual(v2, comValue)) {
        //console.log("  #field.change:", this.name, v2)
        this.$notify("change", {
          name: this.name,
          value: v2
        })
      }
    },
    //--------------------------------------------
    async evalTheCom() {
      let theCom = await this.evalDataForFieldDisplayItem({
        itemData: this.data,
        displayItem: this.CurrentDisplayItem,
        vars: {
          "isActived": this.isActived,
          "disabled": this.disabled
        },
        autoIgnoreNil: false,
        autoIgnoreBlank: false,
        autoValue: this.autoValue
      })
      // console.log("evalTheCom", {
      //   myUID      : this._uid,
      //   isActived  : this.isActived,
      //   oldComType : this.myComType,
      //   oldComConf : _.cloneDeep(this.myComConf),
      //   newComType : theCom.comType,
      //   newComConf : _.cloneDeep(theCom.comConf),
      // })

      if (!theCom) {
        this.myComType = undefined
        this.myComConf = undefined
        this.isComReady = false
        return
      }

      if (this.myComType != theCom.comType) {
        this.myComType = theCom.comType
      }
      if (!_.isEqual(this.myComConf, theCom.comConf)) {
        this.myComConf = theCom.comConf
      }

      this.isComReady = true
    },
    //--------------------------------------------
    evalInputValue(val) {
      // apply default
      if (_.isUndefined(val)) {
        return _.cloneDeep(
          Ti.Util.fallback(this.undefinedAs, this.defaultAs)
        )
      }
      if (_.isNull(val)) {
        return _.cloneDeep(
          Ti.Util.fallback(this.nullAs, this.defaultAs, null)
        )
      }
      if (this.isNumberType && isNaN(val)) {
        return _.cloneDeep(
          Ti.Util.fallback(this.nanAs, this.defaultAs, NaN)
        )
      }
      if (_.isEmpty(val) && _.isString(val)) {
        let re = _.cloneDeep(
          Ti.Util.fallback(this.emptyAs, this.defaultAs, "")
        )
        if ("~~undefined~~" == re)
          return
        return re
      }
      return val
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  watch: {
    "CurrentDisplayItem": "evalTheCom",
    "data": {
      handler: "evalTheCom",
      immediate: true
    }
  }
  ////////////////////////////////////////////////
}
export default _M;