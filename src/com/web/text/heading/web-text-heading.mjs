export default {
  /////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "value": undefined,
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "href" : {
      type: String
    },
    "moreHref": {
      type: String
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "icon": {
      type : String
    },
    "title" : {
      type : String
    },
    "titleIcon" : {
      type : String
    },
    "titleClass": {
      type: [String, Array, Object]
    },
    "titleStyle": {
      type: Object
    },
    "comment" : {
      type : String
    },
    "more": {
      type: String
    },
    "moreIcon": {
      type: String
    },
    "moreText": {
      type: String
    }
  },
  //////////////////////////////////////////
  computed: {
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    TitleClass() {
      return Ti.Css.mergeClassName(this.titleClass)
    },
    //--------------------------------------
    TitleStyle() {
      return Ti.Css.toStyle(this.titleStyle)
    },
    //--------------------------------------
    showMore() {
      if(this.moreText || this.moreIcon)
        return true
      return false
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickTitle() {
      if(this.value) {
        this.$notify("fire", this.value)
      }
    },
    //--------------------------------------
    OnClickMore() {
      if(this.more) {
        this.$notify("more", this.value)
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}