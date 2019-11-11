export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "inputCompositionstart" : false,
    "isFocused" : false,
    "pointerHover" : null
  }),
  ////////////////////////////////////////////////////
  watch : {
    "focus" : function(v) {
      this.isFocused = v
    }
  },
  ////////////////////////////////////////////////////
  props : {
    "className" : null,
    "value" : null,
    "format" : {
      type : [String, Array, Object],
      default : undefined
    },
    "readonly" : {
      type: Boolean,
      default : false
    },
    "valueCase" : {
      type : String,
      default : null,
      validator : (cs)=>(Ti.Util.isNil(cs)||Ti.S.isValidCase(cs))
    },
    "placeholder" : {
      type : [String, Number],
      default : null
    },
    "trimed" : {
      type : Boolean,
      default : true
    },
    "hideBorder" : {
      type : Boolean,
      default : false
    },
    "width" : {
      type : [Number, String],
      default : null
    },
    "height" : {
      type : [Number, String],
      default : null
    },
    "prefixHoverIcon" : {
      type : String,
      default : "zmdi-close-circle"
    },
    "prefixIconForClean" : {
      type : Boolean,
      default : true
    },
    "prefixIcon" : {
      type : String,
      default : null
    },
    "prefixText" : {
      type : String,
      default : null
    },
    "suffixText" : {
      type : String,
      default : null
    },
    "suffixIcon" : {
      type : String,
      default : null
    },
    "focus" : {
      type : Boolean,
      default : false
    },
    "hover" : {
      type : [Array, String],
      default : ()=>["prefixIcon", "suffixIcon"]
    },
    "autoSelect" : {
      type : Boolean,
      default : false
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className, {
        "show-border"  : !this.hideBorder,
        "hide-border"  : this.hideBorder,
        "is-focused"   : this.isFocused,
        "is-blurred"   : !this.isFocused,
        "is-readonly"  : this.readonly,
        "has-prefix-icon" : this.thePrefixIcon,
        "has-prefix-text" : this.prefixText,
        "has-suffix-icon" : this.suffixIcon,
        "has-suffix-text" : this.suffixText,
      })
    },
    //------------------------------------------------
    topStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //------------------------------------------------
    theValue() {
      //console.log("input value:", this.value)
      return Ti.Types.toStr(this.value, this.format)
    },
    //------------------------------------------------
    thePrefixIcon() {
      if("prefixIcon" == this.pointerHover
        && this.isCanHover("prefixIcon")) {
        return this.prefixHoverIcon || this.prefixIcon
      }
      return this.prefixIcon
    },
    //------------------------------------------------
    theHover() {
      let map = {}
      let hos = _.concat(this.hover)
      for(let ho of hos) {
        if(ho) {
          map[ho] = true
        }
      }
      return map
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    isCanHover(hoverName) {
      return this.theHover[hoverName] ? true : false
    },
    //------------------------------------------------
    getHoverClass(hoverName) {
      let canHover = this.isCanHover(hoverName)
      return {
        "can-hover" : canHover,
        "for-look"  : !canHover
      }
    },
    //------------------------------------------------
    onInputCompositionStart(){
      this.inputCompositionstart = true
    },
    //------------------------------------------------
    onInputCompositionEnd(){
      this.inputCompositionstart = false
      this.doWhenInput()
    },
    //------------------------------------------------
    onInputing($event) {
      if(!this.inputCompositionstart) {
        this.doWhenInput()
      }
    },
    //------------------------------------------------
    doWhenInput(emitName="inputing") {
      if(_.isElement(this.$refs.input)) {
        //console.log("doWhenInput", emitName)
        let val = this.$refs.input.value
        if(this.trimed) {
          val = _.trim(val)
        }
        val = Ti.S.toCase(val, this.valueCase)
        this.$emit(emitName, val)
      }
    },
    //------------------------------------------------
    onInputKeyDown($event) {
      let payload = _.pick($event, 
        "code","key","keyCode",
        "altKey","ctrlKey","metaKey","shiftKey")
      payload.uniqueKey = Ti.Shortcut.getUniqueKey(payload)
      payload.$event = $event
      this.$emit("keypress", payload)
    },
    //------------------------------------------------
    onInputChanged() {
      this.doWhenInput("changed")
    },
    //------------------------------------------------
    onInputFocus() {
      if(this.autoSelect && !this.readonly) {
        this.$refs.input.select()
      }
      this.isFocused = true
      this.$emit("focused")      
    },
    //------------------------------------------------
    onInputBlur() {
      this.isFocused = false
      this.$emit("blurred")
    },
    //------------------------------------------------
    onClickPrefixIcon() {
      if(this.prefixIconForClean) {
        this.$emit("changed", null)
      }
      this.$emit("prefix:icon")
    },
    //------------------------------------------------
    onClickPrefixText() {
      this.$emit("prefix:text")
    },
    //------------------------------------------------
    onClickSuffixIcon() {
      this.$emit("suffix:icon")
    },
    //------------------------------------------------
    onClickSuffixText() {
      this.$emit("suffix:text")
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}