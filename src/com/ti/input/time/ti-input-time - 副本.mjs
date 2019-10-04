export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "dropOpened" : false,
    "focused"    : false,
    "dropTime"   : null
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
        if(this.dropTime) {
          let tm = this.dropTime
          this.dropTime = null
          let str = this.getTimeText(tm)
          this.$emit("changed", str)
        }
      }
    }
  },
  ////////////////////////////////////////////////////
  props : {
    "className" : {
      type : String,
      default : null
    },
    "value" : {
      type : [String, Number, Ti.Types.Time],
      default : null
    },
    /***
     * Value unit when value is Number
     */
    "valueUnit" : {
      type : String,
      default : "s",
      validator : function(unit) {
        return /^(ms|s|min|hr)$/.test(unit)
      }
    },
    // Display mode
    "mode" : {
      type : String,
      default : "auto",
      /***
       * - `sec`  : "HH:mm:ss"
       * - `min`  : "HH:mm"
       * - `auto` : "HH:mm" or "HH:mm:ss" if `ss` no zero
       */
      validator : function(unit) {
        return /^(sec|min|auto)$/.test(unit)
      }
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
    "dropHeight" : {
      type : [Number, String],
      default : 200
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
      return {
        "height" : Ti.Css.toSize(this.dropHeight)
      }
    },
    //------------------------------------------------
    theTime() {
      //console.log("input value:", this.value)
      return Ti.Types.toTime(this.value, this.valueUnit)
    },
    //------------------------------------------------
    theDropTime() {
         return this.dropTime || this.theTime
     },
    //------------------------------------------------
    theTimeFormat() {
      return ({
        "sec"  : "HH:mm:ss",
        "min"  : "HH:mm",
        "auto" : "auto"
      })[this.mode]
    },
    //------------------------------------------------
    theTimeText() {
      return this.getTimeText(this.theTime)
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
          let tm  = Ti.Types.toTime(val)
          let str = this.getTimeText(tm)
          this.$emit("changed", str)
        }
      }
    },
    //------------------------------------------------
    onTimeChanged(time) {
      this.dropTime = time
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
          let r_box  = $box.getBoundingClientRect()
          Ti.Dom.setStyle($drop, {
            "width" : `${r_box.width}px`
          })

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
    this.dockDrop()
  }
  ////////////////////////////////////////////////////
}