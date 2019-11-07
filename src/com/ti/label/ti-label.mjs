export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data: ()=>({
    "theValue" : null
  }),
  //////////////////////////////////////////
  props : {
    "blankAs" : {
      type : String,
      default : "i18n:nil"
    },
    "value" : null,
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
    "dict" : {
      type : String,
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    isBlank() {
      if(_.isNumber(this.value))
        return false
      return this.value ? false : true
    },
    topClass() {
      return {
        "is-blank" : this.isBlank
      }
    }
  },
  //////////////////////////////////////////
  watch : {
    "value" : async function() {
      this.theValue = await this.evalTheValue()
    }
  },
  //////////////////////////////////////////
  methods : {
    async evalTheValue() {
      // Blank value
      if(this.isBlank) {
        return Ti.I18n.text(this.blankAs)
      }
      // Look up dictionary
      if(this.dict) {
        return await Wn.Dict.get(this.dict, this.value)
      }
      // Format to display
      let str = Ti.Types.toStr(this.value, this.format)
      // I18n ...
      return Ti.I18n.text(str)
    }
  },
  //////////////////////////////////////////
  mounted : async function() {
    this.theValue = await this.evalTheValue()
  }
  //////////////////////////////////////////
}