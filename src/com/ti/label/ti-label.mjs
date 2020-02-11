export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  props : {
    "className" : null,
    "blankAs" : {
      type : String,
      default : "i18n:nil"
    },
    "value" : null,
    "autoI18n" : {
      type : Boolean,
      default : true
    },
    "trim" : {
      type : Boolean,
      default : true
    },
    "format" : undefined,
    "prefixIcon" : {
      type : String,
      default : null
    },
    "prefixText" : {
      type : String,
      default : null
    },
    "suffixText" : {
      type : String,
      default : null
    },
    "suffixIcon" : {
      type : String,
      default : null
    },
    "href" : {
      type : String,
      default : null
    },
    "newTab" : {
      type : Boolean,
      default : false
    },
    "breakLine" : {
      type : Boolean,
      default : true
    },
    "editable" : {
      type : Boolean,
      default : false
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-self-actived" : this.isSelfActived,
        "is-actived" : this.isActived,
        "is-break-line" : this.breakLine,
        "is-blank"   : !_.isNumber(this.theValue) && _.isEmpty(this.theValue)
      }, this.className)
    },
    //--------------------------------------
    theLinkTarget() {
      if(this.newTab) {
        return "_blank"
      }
    },
    //--------------------------------------
    hasHref() {
      return this.href ? true : false
    },
    //--------------------------------------
    theValue() {
      let str = this.value
      // Auto trim
      if(this.trim && _.isString(str)) {
        return _.trim(str)
      }
      // Return it directly
      return str
    },
    //--------------------------------------
    theDisplayValue() {
      let val = this.theValue
      // Number
      if(_.isNumber(val)) {
        return val
      }
      // Collection
      if(_.isArray(val) || _.isPlainObject(val)) {
        return JSON.stringify(val, null, '  ')
      }
      // Normal value
      if(Ti.Util.isNil(val)) {
        return Ti.I18n.text(this.blankAs)
      }
      // Date
      if(_.isDate(val)) {
        return Ti.Types.toStr(val, this.format)
      }
      // Auto format
      if(this.format) {
        val = Ti.Types.toStr(val, this.format)
      }
      // Return & auto-i18n
      return this.autoI18n 
              ? Ti.I18n.text(val)
              : val
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    onDblClick() {
      if(this.editable) {
        Ti.Be.EditIt(this.$el, {
          text: this.value,
          ok : (newVal)=> {
            this.$emit("changed", newVal)
          }
        })
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}