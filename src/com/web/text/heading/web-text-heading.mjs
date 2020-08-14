export default {
  /////////////////////////////////////////
  props : {
    "icon": {
      type : String,
      default: null
    },
    "title" : {
      type : String,
      default : null
    },
    "titleClass": {
      type: [String, Array, Object],
      default: undefined
    },
    "titleStyle": {
      type: Object,
      default: undefined
    },
    "comment" : {
      type : String,
      default : null
    },
    "more": {
      type: String,
      default: null
    },
    "value": null
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
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickTitle() {
      this.$notify("fire", this.value)
    },
    //--------------------------------------
    OnClickMore() {
      this.$notify("more", this.value)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}