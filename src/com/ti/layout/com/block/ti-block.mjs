export default {
  inheritAttrs : true,
  /////////////////////////////////////////
  props : {
    "float" : {
      type : Boolean,
      default : false
    },
    "title" : {
      type : String,
      default : null
    },
    "icon" : {
      type : String,
      default : null
    },
    "actions" : {
      type : Array,
      default : ()=>[]
    },
    "name" : {
      type : String,
      default : null
    },
    "adjustable" : {
      type : Boolean,
      default : true
    },
    "width" : {
      type : [String,Number],
      default : -1
    },
    "height" : {
      type : [String,Number],
      default : -1
    },
    "overflow" : {
      type : String,
      default : null
    },
    "closer" : {
      type : [Boolean, String],
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    hasTitle() {
      return this.title ? true : false
    },
    hasIcon() {
      return this.icon ? true : false
    },
    hasActions() {
      return !_.isEmpty(this.actions)
    },
    hasCloser() {
      return this.closer ? true : false
    },
    closerClass() {
      let klass = []
      if(this.float) {
        if(_.isBoolean(this.closer) || "default" == this.closer) {
          klass.push("is-docked")
          klass.push("at-default")
        } else {
          klass.push("is-float")
          klass.push(`at-${this.closer}`)
        }
      }
      // docked
      else {
        klass.push("is-docked")
      }
      return klass.join(" ")
    },
    closerIconName() {
      // Float block (in panel) it will should closer
      if(this.float) {
        return "zmdi-close"
      }
      // Docking block, closer should like minus
      else {
        return "zmdi-minus"
      }
    },
    showHeader() {
      return this.hasTitle 
              || this.hasIcon 
              || this.hasActions
              || (this.hasCloser
                  && (true === this.closer
                    || "default" == this.closer)
                )
    },
    topClass() {
      let klass = []
      if(this.showHeader) {
        klass.push("show-header")
      }
      if(this.float) {
        klass.push("is-panel")
      }
      return klass.join(" ")
    },
    topStyle() {
      let style = {}
      if(_.isString(this.width) || this.width > 0) {
        style.width = Ti.Css.toSize(this.width)
      }
      if(_.isString(this.height) || this.height > 0) {
        style.height = Ti.Css.toSize(this.height)
      }
      // If defined width/height, should forbid the flex auto
      if(!_.isEmpty(style)) {
        style.flex = "0 0 auto"
      }
      // append overflow setting
      if(this.overflow) {
        style.overflow = this.overflow
      }
      return style
    }
  },
  //////////////////////////////////////////
  methods : {
    onCloseBlock() {
      //console.log("$emit->block:hide", this.name)
      this.$emit("block:hide", this.name)
    }
  }
  //////////////////////////////////////////
}