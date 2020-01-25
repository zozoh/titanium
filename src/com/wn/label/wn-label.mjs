export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data: ()=>({
    "theValue" : null
  }),
  //////////////////////////////////////////
  props : {
    "className" : null,
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
    },
    "href" : {
      type : String,
      default : null
    },
    "newTab" : {
      type : Boolean,
      default : false
    }
  },
  //////////////////////////////////////////
  watch : {
    "value" : async function() {
      await this.evalTheValue()
    }
  },
  //////////////////////////////////////////
  methods : {
    async evalTheValue() {
      // Blank value
      if(!Ti.Util.isNil(this.value) && this.dict) {
        this.theValue = await Wn.Dict.get(this.dict, this.value)
      }
      // Keep primary
      else {
        this.theValue = this.value
      }
    }
  },
  //////////////////////////////////////////
  mounted : async function() {
    await this.evalTheValue()
  }
  //////////////////////////////////////////
}