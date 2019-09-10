export default {
  /////////////////////////////////////////
  props : {
    "content" : {
      type : String,
      default : ""
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    html() {
      let md = markdownit({
        linkify : true
      })
      return md.render(this.content)
    }
    //......................................
  }
  //////////////////////////////////////////
}