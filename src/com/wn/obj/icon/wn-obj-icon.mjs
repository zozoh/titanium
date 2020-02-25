/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    // icon string
    "icon" : {
      type : String,
      default : null
    },
    // image thumb: id:xxxx
    "thumb" : {
      type : String,
      default : null
    },
    "mime" : {
      type : String,
      default : null
    },
    "type" : {
      type : String,
      default : null
    },
    "race" : {
      type : String,
      default : null
    },
    // default icon string
    "defaultIcon" : {
      type : String,
      default : null
    },
    // timestamp
    "timestamp" : {
      type : Number,
      default : 0
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //-----------------------------------------------
    theIcon() {
      // Thumb as image
      if(this.thumb) {
        let src = `/o/content?str=${this.thumb}`
        if(this.timestamp > 0) {
          src += `&_t=${this.timestamp}`
        }
        return {
          type : "image",
          value : src
        }
      }
      //.............................................
      // Icon
      if(this.icon) {
        return {
          type  : "font",
          value  : this.icon
        }
      }
      //.............................................
      // Force Default
      if(this.defaultIcon) {
        return this.defaultIcon
      }
      //.............................................
      // Auto
      let obj = _.pick(this, "type", "mime", "race")
      if(!_.isEmpty(obj)) {
        return Ti.Icons.get(obj)
      }
      // Default
      return "fas-cube"
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////
}