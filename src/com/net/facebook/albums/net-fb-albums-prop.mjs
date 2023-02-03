export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "oDir": {
    type: Object
  },
  "domain": {
    type: String
  },
  "scope": {
    type: String
  },
  "userId": {
    type: String
  },
  "userName": {
    type: String
  },
  // "userAlbumIds" : {
  //   type : Array,
  //   default: ()=>[]
  // },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "apiVersion": {
    type: String,
    default: "v10.0"
  },
  "autoLogAppEvents": {
    type: Boolean,
    default: true
  },
  "xfbml": {
    type: Boolean,
    default: true
  },
  "notifyName": {
    type: String
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "thumbMinHeight": {
    type: Number,
    default: 320
  }
}