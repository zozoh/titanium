export default {
  /////////////////////////////////////////
  props : {
    "icon": {
      type : String,
      default: undefined
    },
    "title" : {
      type : String,
      default : undefined
    },
    "titleClass": {
      type: [String, Array, Object],
      default: undefined
    },
    "titleStyle": {
      type: Object,
      default: undefined
    },
    "value": undefined,
    "href" : {
      type: String,
      default: undefined
    },
    "comment" : {
      type : String,
      default : undefined
    },
    "more": {
      type: String,
      default: undefined
    },
    "moreIcon": {
      type: String,
      default: undefined
    },
    "moreText": {
      type: String,
      default: undefined
    },
    "moreHref": {
      type: String,
      default: undefined
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