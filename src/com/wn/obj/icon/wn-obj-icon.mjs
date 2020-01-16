/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    "className" : null,
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
    // default icon string
    "defaultIcon" : {
      type : String,
      default : "fas-cube"
    },
    // timestamp
    "timestamp" : {
      type : Number,
      default : 0
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
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
      // Icon
      return {
        type  : "font",
        value  : this.icon || this.defaultIcon || "fas-cube"
      }
    }
  },
  ///////////////////////////////////////////////////
  methods : {
    
  }
  ///////////////////////////////////////////////////
}