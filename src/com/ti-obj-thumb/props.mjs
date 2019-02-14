export default {
  // The text to present the object
  title : {
    type : String,
    default : ()=>null
  },
  // The URL of thumb
  preview : {
    type : Object,
    default : ()=>({
      type : "icon",
      value : "broken_image"
    })
  },
  highlight : {
    type : Boolean,
    default : false
  },
  index : {
    type : Number,
    default : -1
  }
}