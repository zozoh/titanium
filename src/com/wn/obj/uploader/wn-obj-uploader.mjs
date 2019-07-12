export default {
  /////////////////////////////////////////
  props : {
    "value" : {
      type : [String, Object, Array],
      default : null
    },
    // true - support multiple object 
    "multi" : {
      type : Boolean,
      default : true
    },
    // support remove the objects
    "removable" : {
      type : Boolean,
      default : true
    },
    // Before removed, how many objects shuld be remained at least
    "remained" : {
      type : Number,
      default : 0
    },
    // If null value, new object will be uploaded to here
    // path ends with `/` mean folder, it will keep the local name 
    // if without define, can not upload new file
    // for path, the "~" has been supported also
    "target" : {
      type : String,
      default : null
    },
    // When create a new file to target folder, 
    // how to format the local name
    "nameTransformer" : {
      type : [Function, String, Object],
      default : null
    },
    // which type supported to upload
    // nulllor empty array will support any types
    "supportTypes" : {
      type : [Array, String],
      default : null
    },
    // Image object only: it will auto apply image filter
    // just like clip the image size etc..
    // @see cmd_imagic for more detail about the filter
    "imageFilter" : {
      type : [Array, String],
      default : null
    },
    // Image object only: if `>0 and <=1` mean output quality
    // if not match the range, will depends on the `cmd_imagic` default
    "imageQuality" : {
      type : Number,
      default : 0
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    //--------------------------------------
    formedValue() {
      return null
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    getObj(income) {
      if(income) {
        if(_.isString(income)) {
          
        }
      }
    }
  }
}