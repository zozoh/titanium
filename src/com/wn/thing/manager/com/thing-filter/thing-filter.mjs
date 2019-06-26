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
    },
    "status" : {
      type : Object,
      default : ()=>({})
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
    },
    isInRecycleBin() {
      return this.status.inRecycleBin
    },
    topClass() {
      return {
        "in-recycle-bin" : this.isInRecycleBin
      }      
    }
  },
  ///////////////////////////////////////////
  methods : {
    // When this func be invoked, the recycleBin must be true
    onLeaveRecycleBin() {
      let app = Ti.App(this)
      app.dispatch('main/toggleInRecycleBin')
    }
  }
  ///////////////////////////////////////////
}