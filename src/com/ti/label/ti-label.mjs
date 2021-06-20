const _M = {
  //////////////////////////////////////////
  data: () => ({
    myDisplayIcon: undefined,
    myDisplayText: undefined,
    myDictValKey: undefined
  }),
  //////////////////////////////////////////
  props: {
    "autoLoadDictIcon": {
      type: Boolean,
      default: true
    },
    "valueClickable": {
      type: Boolean,
      default: false
    },
    "fullField": {
      type: Boolean,
      default: true
    },
    "multiValSep": {
      type: String,
      default: ", "
    },
    "hoverable": {
      type: Boolean,
      default: false
    },
    "enterNotifyName": {
      type: String,
      default: "enter"
    },
    "leaveNotifyName": {
      type: String,
      default: "leave"
    },
    "hoverNotifyPayload": undefined
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-blank": !_.isNumber(this.TheValue) && _.isEmpty(this.TheValue),
        "is-nowrap": this.valueMaxWidth > 0,
        "full-field": this.fullField
      })
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      })
    },
    //--------------------------------------
    TheFormat() {
      if (_.isFunction(this.format)) {
        return this.format
      }
      if (this.format) {
        if (this.autoI18n) {
          let str = Ti.I18n.text(this.format)
          return (val) => {
            return Ti.S.renderVars(val, str)
          }
        }
        return (val) => {
          return Ti.S.renderVars(val, this.format)
        }
      }
    },
    //--------------------------------------
    ValueStyle() {
      return Ti.Css.toStyle({
        maxWidth: this.valueMaxWidth
      })
    },
    //--------------------------------------
    ThePrefixIcon() {
      if (null === this.prefixIcon)
        return null
      return this.myDisplayIcon || this.prefixIcon
    },
    //--------------------------------------
    ThePrefixText() {
      return Ti.Util.explainObj(this, this.prefixText)
    },
    //--------------------------------------
    TheSuffixText() {
      return Ti.Util.explainObj(this, this.suffixText)
    },
    //--------------------------------------
    TheHover() {
      let map = {}
      let hos = _.concat(this.hover)
      for (let ho of hos) {
        if (ho) {
          map[ho] = true
        }
      }
      return map
    },
    //--------------------------------------
    TheValue() {
      let str = this.value
      // Auto trim
      if (this.trim && _.isString(str)) {
        return _.trim(str)
      }
      // Return it directly
      return str
    },
    //--------------------------------------
    Dict() {
      if (this.dict) {
        // Already Dict
        if (this.dict instanceof Ti.Dict) {
          this.myDictValKey = ".text"
          return this.dict
        }
        // Get back
        let { name, vKey } = Ti.DictFactory.explainDictName(this.dict)
        this.myDictValKey = vKey || ".text"
        return Ti.DictFactory.CheckDict(name)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnMouseEnter() {
      if (this.hoverable && this.enterNotifyName) {
        let pld = _.assign({
          $el: this.$el,
          value: this.value,
        }, this.hoverNotifyPayload)
        this.$notify(this.enterNotifyName, pld)
      }
    },
    //--------------------------------------
    OnMouseLeave() {
      if (this.hoverable && this.leaveNotifyName) {
        let pld = _.assign({
          $el: this.$el,
          value: this.value,
        }, this.hoverNotifyPayload)
        this.$notify(this.leaveNotifyName, pld)
      }
    },
    //--------------------------------------
    isCanHover(hoverName) {
      return this.TheHover[hoverName] ? true : false
    },
    //------------------------------------------------
    getHoverClass(hoverName) {
      let canHover = this.isCanHover(hoverName)
      return {
        "can-hover": canHover,
        "for-look": !canHover,
        "is-prefix-icon-hover": "prefixIcon" == hoverName
      }
    },
    //--------------------------------------
    OnDblClick() {
      if (this.editable) {
        Ti.Be.EditIt(this.$el, {
          text: this.TheValue,
          ok: (newVal) => {
            let val = Ti.S.toCase(newVal, this.valueCase)
            this.$notify("change", val)
          }
        })
      }
    },
    //------------------------------------------------
    OnClickPrefixIcon() {
      this.$notify("prefix:icon")
    },
    //------------------------------------------------
    OnClickPrefixText() {
      this.$notify("prefix:text")
    },
    //------------------------------------------------
    OnClickValue() {
      if (this.valueClickable) {
        this.$notify("click:value")
      }
    },
    //------------------------------------------------
    OnClickSuffixIcon() {
      this.$notify("suffix:icon")
    },
    //------------------------------------------------
    OnClickSuffixText() {
      this.$notify("suffix:text")
    },
    //--------------------------------------
    async evalDisplay(val) {
      if (_.isString(val) && Ti.S.isBlank(val)) {
        return Ti.I18n.get("blank")
      }
      // By Dict Item
      if (this.Dict) {
        // Array value
        if (_.isArray(val)) {
          this.myDisplayIcon = undefined
          let ss = []
          for (let v of val) {
            let it = await this.Dict.getItem(v)
            let s = this.Dict.getBy(this.myDictValKey, it, v)
            if (!Ti.Util.isNil(s) || this.valueMustInDict) {
              ss.push(s)
            } else {
              ss.push(v)
            }
          }
          val = ss.join(this.multiValSep)
        }
        // Single value
        else {
          let it = await this.Dict.getItem(val)
          if (it) {
            if (this.autoLoadDictIcon) {
              this.myDisplayIcon = this.Dict.getIcon(it)
            }
            let v2 = this.Dict.getBy(this.myDictValKey, it, val)
            if (!Ti.Util.isNil(v2) || this.valueMustInDict) {
              val = v2
            }
          } else if (this.valueMustInDict) {
            val = null
            this.myDisplayIcon = null
          }
        }
      }
      // Number
      if (_.isNumber(val)) {
        if (this.TheFormat) {
          return Ti.Types.toStr(val, this.TheFormat)
        }
        return val
      }
      // Collection
      if (_.isArray(val)) {
        if (this.format) {
          let ss = []
          for (let v of val) {
            // [{...}, {...}]
            if (_.isPlainObject(v)) {
              ss.push(Ti.S.renderBy(this.format, v))
            }
            // ['xxx',  'xxx']
            else {
              ss.push(Ti.S.renderBy(this.format, { val: v }))
            }
          }
          return ss.join(this.multiValSep)
        }
        if (val.length > 1 && (_.isPlainObject(val[0]) || _.isArray(val[0]))) {
          return JSON.stringify(val)
        }
        return val.join(this.multiValSep)
      }
      // Auto format
      if (_.isFunction(this.TheFormat)) {
        return this.TheFormat(val)
      }
      // Object
      if (_.isPlainObject(val)) {
        return JSON.stringify(val, null, '  ')
      }
      // Normal value
      if (Ti.Util.isNil(val)) {
        return Ti.I18n.text(this.placeholder)
      }
      // Date
      if (_.isDate(val)) {
        return Ti.Types.toStr(val, this.TheFormat)
      }
      // Return & auto-i18n
      return this.autoI18n
        ? Ti.I18n.text(val)
        : val
    },
    //--------------------------------------
    async reloadMyDisplay() {
      this.myDisplayIcon = null
      this.myDisplayText = await this.evalDisplay(this.TheValue)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "value": {
      handler: "reloadMyDisplay",
      immediate: true
    }
  }
  //////////////////////////////////////////
}
export default _M;