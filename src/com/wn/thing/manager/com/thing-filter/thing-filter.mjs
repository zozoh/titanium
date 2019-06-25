export default {
  ///////////////////////////////////////////
  data : ()=>({
    keywordFocus : false
  }),
  ///////////////////////////////////////////
  props : {
    "placeholder" : {
      type : String,
      default : "i18n:thing-filter-kwdplhd"
    },
    "searchIcon" : {
      type : String,
      default : "zmdi-search"
    }
  },
  ///////////////////////////////////////////
  computed : {
    placeholderText() {
      if(this.placeholder)
        return Ti.I18n.text(this.placeholder)
      return ""
    },
    hasSearchIcon() {
      return this.searchIcon ? true : false
    },
    keywordClass() {
      return {
        "has-icon" : this.hasSearchIcon,
        "is-focus" : this.keywordFocus
      }
    }
  },
  ///////////////////////////////////////////
  methods : {
    
  }
  ///////////////////////////////////////////
}