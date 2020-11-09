const _M = {
  //////////////////////////////////////////
  data : ()=>({
    myDisplayIcon : undefined,
    myDisplayText : undefined,
    myDictValKey  : undefined
  }),
  //////////////////////////////////////////
  props: {
    "autoLoadDictIcon": {
      type : Boolean,
      default: true
    },
    "valueClickable" : {
      type : Boolean,
      default: false
    },
    "fullField": {
      type : Boolean,
      default : true
    },
    "multiValSep" : {
      type : String,
      default: ", "
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-blank"   : !_.isNumber(this.TheValue) && _.isEmpty(this.TheValue),
        "is-nowrap"  : this.valueMaxWidth>0,
        "full-field" : this.fullField
      })
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //--------------------------------------
    TheFormat() {
      if(_.isFunction(this.format)) {
        return this.format
      }
      if(this.format) {
        if(this.autoI18n) {
          let str = Ti.I18n.text(this.format)
          return (val)=> {
            return Ti.S.renderBy(str, val)
          }
        }
        return (val)=> {
          return Ti.S.renderBy(this.format, val)
        }
      }
    },
    //--------------------------------------
    ValueStyle() {
      return Ti.Css.toStyle({
        maxWidth : this.valueMaxWidth
      })
    },
    //--------------------------------------
    ThePrefixIcon() {
      if(null === this.prefixIcon)
        return null
      return this.myDisplayIcon || this.prefixIcon
    },
    //------------------------------------------------
    TheHover() {
      let map = {}
      let hos = _.concat(this.hover)
      for(let ho of hos) {
        if(ho) {
          map[ho] = true
        }
      }
      return map
    },
    //--------------------------------------
    TheValue() {
      let str = this.value
      // Auto trim
      if(this.trim && _.isString(str)) {
        return _.trim(str)
      }
      // Return it directly
      return str
    },
    //--------------------------------------
    Dict() {
      if(this.dict) {
        // Already Dict
        if(this.dict instanceof Ti.Dict) {
          this.myDictValKey = ".text"
          return this.dict
        }
        // Get back
        let {name, vKey} = Ti.DictFactory.explainDictName(this.dict)
        this.myDictValKey = vKey || ".text"
        return Ti.DictFactory.CheckDict(name)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //------------------------------------------------
    isCanHover(hoverName) {
      return this.TheHover[hoverName] ? true : false
    },
    //------------------------------------------------
    getHoverClass(hoverName) {
      let canHover = this.isCanHover(hoverName)
      return {
        "can-hover" : canHover,
        "for-look"  : !canHover,
        "is-prefix-icon-hover" : "prefixIcon" == hoverName
      }
    },
    //--------------------------------------
    OnDblClick() {
      if(this.editable) {
        Ti.Be.EditIt(this.$el, {
          text: this.TheValue,
          ok : (newVal)=> {
            this.$notify("change", newVal)
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
      if(this.valueClickable) {
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
      // By Dict Item
      if(this.Dict) {
        // console.log(val)
        // Array value
        if(_.isArray(val)) {
          this.myDisplayIcon = undefined
          let ss = []
          for(let v of val) {
            let it = await this.Dict.getItem(v)
            let s = this.Dict.getBy(this.myDictValKey, it, v)
            ss.push(s)
          }
          val = ss.join(this.multiValSep)
        }
        // Single value
        else {
          let it = await this.Dict.getItem(val)
          if(it) {
            if(this.autoLoadDictIcon) {
              this.myDisplayIcon = this.Dict.getIcon(it)
            }
            val = this.Dict.getBy(this.myDictValKey, it, val)
          } else {
            this.myDisplayIcon = null
          }
        }
      }
      // Number
      if(_.isNumber(val)) {
        if(this.TheFormat) {
          return Ti.Types.toStr(val, this.TheFormat)
        }
        return val
      }
      // Collection
      if(_.isArray(val)) {
        if(val.length > 1 && (_.isPlainObject(val[0]) || _.isArray(val[0]))) {
          return JSON.stringify(val)  
        }
        return val.join(this.multiValSep)
      }
      // Object
      if(_.isPlainObject(val)) {
        return JSON.stringify(val, null, '  ')
      }
      // Normal value
      if(Ti.Util.isNil(val)) {
        return Ti.I18n.text(this.placeholder)
      }
      // Date
      if(_.isDate(val)) {
        return Ti.Types.toStr(val, this.TheFormat)
      }
      // Auto format
      if(_.isFunction(this.TheFormat)) {
        return this.TheFormat(val)
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
  watch : {
    "value" : {
      handler   : "reloadMyDisplay",
      immediate : true
    }
  }
  //////////////////////////////////////////
}
export default _M;