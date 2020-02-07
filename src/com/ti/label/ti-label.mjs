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
      // Format to display
      if(this.format || _.isDate(str)) {
        return Ti.Types.toStr(str, this.format)
      }
      // Auto trim
      if(this.trim && str) {
        return _.trim(str)
      }
      // Return it directly
      return str
    },
    //--------------------------------------
    theDisplayValue() {
      let val = this.theValue
      if(_.isNumber(val)) {
        return val
      }
      if(!val) {
        return Ti.I18n.text(this.blankAs)
      }
      if(this.autoI18n) {
        return Ti.I18n.text(val)
      }
      return val
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