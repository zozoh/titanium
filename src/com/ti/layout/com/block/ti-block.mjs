export default {
  inheritAttrs : true,
  /////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
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
    "hideTitle" : {
      type : Boolean,
      default : false
    },
    "actions" : {
      type : Array,
      default : ()=>[]
    },
    "actionDisplayMode" : {
      type : String,
      default : "auto"  // auto|desktop|tablet|phone
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
    },
    "shown" : {
      type : Object,
      default : ()=>({})
    },
    "status" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    blockStatus() {
      return _.assign({}, this.shown, this.status)
    },
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
    isCloserDefault() {
      return true === this.closer || "default" == this.closer
    },
    closerClass() {
      let klass = []
      if(this.float) {
        if(this.isCloserDefault) {
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
    showTitle() {
      return this.hasTitle && !this.hideTitle
    },
    showIcon() {
      return this.hasIcon && !this.hideTitle
    },
    showHeader() {
      return this.showTitle 
              || this.showIcon 
              || this.hasActions
              || (this.hasCloser
                  && (true === this.closer
                    || "default" == this.closer)
                )
    },
    topClass() {
      let klass = []

      // Customized className
      if(this.className) {
        klass.push(this.className)
      }

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
    },
    async hijackEmit(name, args) {
      //console.log("--hijackEmit--", name, args)
      // By Pass: "block:show/hide/event"
      if(/^block:(show|hide|event)$/.test(name)) {
        await this.$emit(name, ...args)
      }
      // Gen Block Event
      else {
        await this.$emit("block:event", {
          block : this.name,
          name, args
        })
      }
    }
  }
  //////////////////////////////////////////
}