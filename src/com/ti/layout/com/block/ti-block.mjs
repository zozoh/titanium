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
    "flex" : {
      type : String,
      default : "auto",
      validator : (v)=>/^(auto|grow|shrink|both|none)$/.test(v)
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
    },
    "hijackable" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "show-header" : this.showHeader,
        "is-panel"    : this.float
      }, this.className, ()=>{
        if(this.name) {
          return `gui-block-${this.name}`
        }
      })
    },
    //--------------------------------------
    topStyle() {
      let style = {}
      if(_.isString(this.width) || this.width > 0) {
        style.width = Ti.Css.toSize(this.width)
      }
      if(_.isString(this.height) || this.height > 0) {
        style.height = Ti.Css.toSize(this.height)
      }
      // If defined width/height, should forbid the flex auto
      if(!_.isEmpty(style) && "auto"==this.flex) {
        style.flex = "0 0 auto"
      }
      // Flex
      else if("auto"!=this.flex) {
        style.flex = ({
          "none"   : "0 0 auto",
          "grow"   : "1 0 auto",
          "shrink" : "0 1 auto",
          "both"   : "1 1 auto"
        })[this.flex]
      }
      // append overflow setting
      if(this.overflow) {
        style.overflow = this.overflow
      }
      return style
    },
    //--------------------------------------
    blockStatus() {
      return _.assign({}, this.shown, this.status)
    },
    //--------------------------------------
    hasTitle() {
      return this.title ? true : false
    },
    //--------------------------------------
    hasIcon() {
      return this.icon ? true : false
    },
    //--------------------------------------
    hasActions() {
      return !_.isEmpty(this.actions)
    },
    //--------------------------------------
    hasCloser() {
      return this.closer ? true : false
    },
    //--------------------------------------
    isCloserDefault() {
      return true === this.closer || "default" == this.closer
    },
    //--------------------------------------
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
    //--------------------------------------
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
    //--------------------------------------
    showTitle() {
      return this.hasTitle && !this.hideTitle
    },
    //--------------------------------------
    showIcon() {
      return this.hasIcon && !this.hideTitle
    },
    //--------------------------------------
    showHeader() {
      return this.showTitle 
              || this.showIcon 
              || this.hasActions
              || (this.hasCloser
                  && (true === this.closer
                    || "default" == this.closer)
                )
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    onShowBlock() {
      this.$emit("block:show", this.name)
    },
    //--------------------------------------
    onCloseBlock() {
      this.$emit("block:hide", this.name)
    },
    //--------------------------------------
    async hijackEmit(name, args) {
      //console.log("ti-block::hijackEmit->", name, args)
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
    //--------------------------------------
  }
  //////////////////////////////////////////
}