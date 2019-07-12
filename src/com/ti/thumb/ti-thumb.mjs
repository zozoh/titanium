export default {
  /////////////////////////////////////////
  props : {
    // The source to display image
    "src" : {
      type : String,
      default : null
    },
    // Display width
    "width" : {
      type : [String, Number],
      default : 400
    },
    // Display height
    "height" : {
      type : [String, Number],
      default : 400
    },
    // support remove the objects
    "removable" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  computed : {
    hasSrc() {
      return this.src ? true : false
    }
  },
  //////////////////////////////////////////
  methods : {
    
  }
}