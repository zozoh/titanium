export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  props : {
    "className" : null,
    "index" : {
      type : Number,
      default : -1
    },
    "atLast" : {
      type : Boolean,
      default : false
    },
    "icon" : {
      type : [String, Object],
      default : null
    },
    "text" : {
      type : String,
      default : null
    },
    "href" : {
      type : String,
      default : null
    },
    "value" : {
      type : [String, Number, Boolean, Object],
      default : null
    },
    "pathIcon" : {
      type : String,
      default : null
    },
    "asterisk" : {
      type : Boolean,
      default : false
    },
    "cancelBubble" : {
      type : Boolean,
      default : true
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "at-tail" : this.atLast,
        "at-path" : !this.atLast,
        "is-asterisk" : this.asterisk
      }, this.className)
    },
    //------------------------------------------------
    textClass() {
      return {
        "without-icon"    : !this.hasIcon && !this.removeIcon
      }
    },
    //------------------------------------------------
    hasIcon() {
      return this.icon ? true : false
    },
    //------------------------------------------------
    theData() {
      return {
        index    : this.index,
        icon     : this.icon,
        text     : this.text,
        value    : this.value,
        href     : this.href,
        atLast   : this.atLast,
        asterisk : this.asterisk
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onClickTop($event) {
      // Show Drop Down
      if(this.hasOptions) {
        $event.stopPropagation()
        this.openDrop()
      }
      // Stop Bubble Up
      else if(this.cancelBubble) {
        $event.stopPropagation()
      }
      // Emit event
      if(this.href) {
        this.$emit("fire", this.theData)
      }
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}