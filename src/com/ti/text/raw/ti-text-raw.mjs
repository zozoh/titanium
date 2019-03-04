export default {
  props : {
    "icon" : {
      type : Object,
      default : {
        type : "font",
        value : "im-hashtag"
      }
    },
    "title" : {
      type : String,
      default : "No Title"
    },
    "content" : {
      type : String,
      default : ""
    }
  }
}