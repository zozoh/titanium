export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    // If image, join the base
    "base" : {
      type : String,
      default : null
    },
    "value" : {
      type : [String,Object],
      default : ""
    },
    "text" : {
      type : String,
      default : null
    },
    "fontSize" : {
      type : [Number, String],
      default : null
    },
    "width" : {
      type : [Number, String],
      default : null
    },
    "height" : {
      type : [Number, String],
      default : null
    },
    "color" : {
      type : String,
      default : ""
    },
    "opacity" : {
      type : Number,
      default : -1
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    topClass() {
      if(this.className)
        return this.className
    },
    //---------------------------------------------------
    // formed icon data
    icon() {
      let icn 
      if(_.isPlainObject(this.value)){
        // Regular icon object, return it directly
        if(this.value.type && this.value.value) {
          icn = this.value
        }
        // Eval it as meta
        else {
          icn = Ti.Icons.get(this.value)
        }
      }
      // String
      else {
        icn = {
          type : "font",
          value : this.value
        }
        if(_.isString(this.value)) {
          icn.type = Ti.Util.getSuffixName(this.value) || "font"
        }
        // for image
        if(/^(jpe?g|gif|png)$/i.test(icn.type)){
          icn.type = "image"
        }
      }

      // Join `className / text` to show icon font
      if('font' == icn.type) {
        _.assign(icn, Ti.Icons.parseFontIcon(icn.value))
      }
      // Join base
      else if('image' == icn.type) {
        if(!Ti.Util.isBlank(this.base)) {
          icn.value = Ti.Util.appendPath(this.base, icn.value)
        }
      }

      // join style:outer
      icn.outerStyle = Ti.Css.toStyle({
        width   : this.width,
        height  : this.height,
        color   : this.color,
        opacity : this.opacity >= 0 ? this.opacity : undefined
      })

      // join style:inner
      if('image' == icn.type) {
        icn.innerStyle = {
          "width"  : this.width  ? "100%" : undefined,
          "height" : this.height ? "100%" : undefined
        }
      }
      // font size
      else if('font' == icn.type) {
        icn.innerStyle = {
          "font-size" : this.fontSize 
                          ? Ti.Css.toSize(this.fontSize) 
                          : undefined
        }
      }

      return icn
    },
    //---------------------------------------------------
  }
  ///////////////////////////////////////////////////////
}