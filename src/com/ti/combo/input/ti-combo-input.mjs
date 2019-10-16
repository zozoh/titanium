export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "dropOpened" : false,
    "focused"    : false,
    "dropDocked" : false,
    "box" : {
      "position" : null,
      "width"  : null,
      "height" : null,
      "top"    : null,
      "left"   : null
    }
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
        this.dropDocked = false
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
    "value" : {
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
      default : null
    },
    "height" : {
      type : [Number, String],
      default : null
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
    theTextOrValue() {
      if(this.editable) {
        if(this.dropOpened) {
          return this.value || this.text
        }
      }
      return this.text
    },
    //------------------------------------------------
    boxStyle() {
      return Ti.Css.toStyle(this.box)
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
    onInputKeyPress($event) {
      let $in = $event.target
      if(_.isElement($in)) {
        let val = _.trim($in.value)
        // Empty value as null
        if(_.isEmpty(val)) {
          this.$emit("keypress", null);
        }
        // Parsed value
        else {
          this.$emit("keypress", val)
        }
      }
    },
    //------------------------------------------------
    onInputChanged($event) {
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
      this.focused = true
      if(this.focusToOpen) {
        this.dropOpened = true
        _.delay(()=>{
          this.$refs.input.focus()
          this.$refs.input.select()
        }, 0)
      }
    },
    //------------------------------------------------
    onInputBlur() {
      this.focused = false
    },
    //------------------------------------------------
    openDrop() {
      this.dropOpened = true
    },
    //------------------------------------------------
    closeDrop() {
      this.dropOpened = false
    },
    //------------------------------------------------
    toggleDrop() {
      this.dropOpened = !this.dropOpened
    },
    //------------------------------------------------
    getTimeText(tm) {
      if(tm instanceof Ti.Types.Time) {
        return tm.toString(this.theTimeFormat)
      }
    },
    //------------------------------------------------
    dockDrop() {
      let $drop  = this.$refs.drop
      let $box   = this.$refs.box
      console.log("dock")
      // Guard the elements
      if(!_.isElement($drop) || !_.isElement($box)){
        return
      }
      // If drop opened, make the box position fixed
      // to at the top of mask
      if(this.dropOpened && !this.dropDocked) {
        let r_box  = Ti.Rects.createBy($box)
        //..........................................
        // Mark parent to hold the place
        Ti.Dom.setStyle(this.$el, {
          width  : r_box.width,
          height : r_box.height
        })
        //..........................................
        // Mark box to fixed position
        Ti.Dom.applyRect($box, r_box)
        _.assign(this.box, {position:"fixed"}, r_box.raw())
        //..........................................
        // Make drop same width with box
        if("box" == this.dropWidth) {
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
        //..........................................
        // Dock drop to box
        Ti.Dom.dockTo($drop, $box, {
          space:{y:2}, posListX:["left", "right"]
        })
        //..........................................
      }
      // Cancel box position fixed
      else {
        Ti.Dom.setStyle(this.$el, {width: "", height: ""})
        _.assign(this.box, {
          position:null, top:null, left:null, 
          width: this.width, height: this.height
        })
      }
      // Mark docked
      this.dropDocked = true
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted : function() {
    this.dropOpened = this.autoOpenDrop
    this.box.width  = this.width
    this.box.height - this.height
    this.dockDrop()
    Ti.Viewport.watch(this, {
      scroll:()=>this.dropOpened=false,
      resize:()=>this.dropOpened=false
    })
  },
  ////////////////////////////////////////////////////
  beforeDestroy : function() {
    Ti.Viewport.unwatch(this)
  }
  ////////////////////////////////////////////////////
}