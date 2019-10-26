export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "inputCompositionstart" : false,
    "focused" : false
  }),
  ////////////////////////////////////////////////////
  props : {
    "className" : null,
    "value" : null,
    "format" : {
      type : [String, Array, Object],
      default : undefined
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
    "width" : {
      type : [Number, String],
      default : null
    },
    "height" : {
      type : [Number, String],
      default : null
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
    "highlight" : {
      type : Boolean,
      default : false
    },
    "hover" : {
      type : [Array, String],
      default : "suffixIcon"
    },
    "autoSelect" : {
      type : Boolean,
      default : true
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className, {
        "is-focused"   : this.focused,
        "is-blurred"   : !this.focused,
        "is-highlight" : this.highlight,
        "has-prefix-icon" : this.prefixIcon,
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
    getHoverClass(hoverName) {
      if(this.theHover[hoverName]) {
        return "can-hover"
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
      if(this.autoSelect) {
        this.$refs.input.select()
      }
      this.focused = true
      this.$emit("focused")      
    },
    //------------------------------------------------
    onInputBlur() {
      this.focused = false
      this.$emit("blurred")
    },
    //------------------------------------------------
    onClickPrefixIcon() {
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
    },
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}