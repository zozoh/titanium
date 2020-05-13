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