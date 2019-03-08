export default {
  props : {
    comType : {
      type : String,
      default : null
    },
    type : {
      type : String,
      default : null
    },
    icon : {
      type : String,
      default : null
    },
    text : {
      type : String,
      default : null
    },
    tip : {
      type : String,
      default : null
    },
    async :{
      type : Object,
      default : null
    }
  },
  computed : {
    i18nText() {
      let m = /^i18n:(.+)$/.exec(this.text)
      if(m) {
        return Ti.I18n.get(m[1])
      }
      return text
    }
  },
  methods : {

  }
}