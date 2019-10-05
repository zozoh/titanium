export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "dropOpened" : false,
    "focused"    : false
  }),
  ////////////////////////////////////////////////////
  watch : {
    "dropOpened" : function(opened){
      // Auto-dock the drop when opened
      if(opened) {
        this.$nextTick(()=>{
          this.dockDrop()
        })
      }
      // Sync the value when hide
      else {
        this.$emit("collapse")
      }
    }
  },
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "icon" : {
      type : String,
      default : null
    },
    "text" : {
      type : String,
      default : null
    },
    "placeholder" : {
      type : [String, Number],
      default : null
    },
    // true : can write time directly
    "editable" : {
      type : Boolean,
      default : true
    },
    // when "editable", it will render text by `input` element
    // This prop indicate if open drop when input was focused
    // `true` as default
    "focusToOpen" : {
      type : Boolean,
      default : true
    },
    "width" : {
      type : [Number, String],
      default : "1.4rem"
    },
    "height" : {
      type : [Number, String],
      default : ".3rem"
    },
    // the height of drop list
    //  - null : will not set the height
    "dropHeight" : {
      type : [Number, String],
      default : null
    },
    // drop width
    //  - "box" : will auto fit with box
    "dropWidth" : {
      type : [Number, String],
      default : "box"
    },
    // For test convenience, default is false
    "autoOpenDrop" : {
      type : Boolean,
      default : false
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      let klass = []
      if(this.className) {
        klass.push(this.className)
      }
      if(this.dropOpened) {
        klass.push("is-drop-opened")
      }
      if(this.focused) {
        klass.push("is-focused")
      }
      if(this.dropOpened || this.focused) {
        klass.push("is-highlight")
      }
      return klass
    },
    //------------------------------------------------
    boxStyle() {
      return {
        "width"  : Ti.Css.toSize(this.width),
        "height" : Ti.Css.toSize(this.height)
      }
    },
    //------------------------------------------------
    dropStyle() {
      if(this.dropHeight) {
        return {
          "height" : Ti.Css.toSize(this.dropHeight)
        }
      }
    },
    //------------------------------------------------
    stateIcon() {
      if(this.dropOpened) {
        return 'zmdi-chevron-up'
      }
      return 'zmdi-chevron-down'
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    onChanged($event) {
      let $in = $event.target
      if(_.isElement($in)) {
        let val = _.trim($in.value)
        // Empty value as null
        if(_.isEmpty(val)) {
          this.$emit("changed", null);
        }
        // Parsed value
        else {
          this.$emit("changed", val)
        }
      }
    },
    //------------------------------------------------
    onInputFocus() {
      if(this.focusToOpen) {
        this.dropOpened = true
      }
    },
    //------------------------------------------------
    getTimeText(tm) {
      if(tm instanceof Ti.Types.Time) {
        return tm.toString(this.theTimeFormat)
      }
    },
    //------------------------------------------------
    dockDrop() {
      if(this.dropOpened) {
        let $drop  = this.$refs.drop
        let $box   = this.$refs.box
        if($drop && $box) {
          // Make drop same width with box
          if("box" == this.dropWidth) {
            let r_box  = $box.getBoundingClientRect()
            Ti.Dom.setStyle($drop, {
              "width" : `${r_box.width}px`
            })
          }
          // Fixed drop width
          else if(this.dropWidth) {
            Ti.Dom.setStyle($drop, {
              "width" : Ti.Css.toSize(this.dropWidth)
            })
          }

          // Dock drop to box
          Ti.Dom.dockTo($drop, $box, {
            space:{y:2}, posListX:["left", "right"]
          })
        }
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted : function() {
    this.dropOpened = this.autoOpenDrop
    this.dockDrop()
  }
  ////////////////////////////////////////////////////
}