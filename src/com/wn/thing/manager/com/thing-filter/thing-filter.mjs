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
    //---------------------------------------
    placeholderText() {
      if(this.placeholder)
        return Ti.I18n.text(this.placeholder)
      return ""
    },
    //---------------------------------------
    keywordClass() {
      return {
        "has-icon" : this.hasSearchIcon,
        "is-focus" : this.keywordFocus
      }
    },
    //---------------------------------------
    isInRecycleBin() {
      return this.status.inRecycleBin
    },
    //---------------------------------------
    topClass() {
      return {
        "in-recycle-bin" : this.isInRecycleBin
      }      
    }
    //---------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //---------------------------------------
    onInputChanged() {
      let name = _.trim(this.$refs.input.value)
      // Empty as undefined
      if(_.isEmpty(name)) {
        name = null
      }
      // make regex
      else {
        name = `^.*${name}.*$`
      }
      Ti.App(this).commit("main/search/updateFilter", {
        th_nm : name
      })
      Ti.App(this).dispatch("main/reloadSearch")
    },
    //---------------------------------------
    // When this func be invoked, the recycleBin must be true
    onLeaveRecycleBin() {
      Ti.App(this).dispatch('main/toggleInRecycleBin')
    }
    //---------------------------------------
  }
  ///////////////////////////////////////////
}