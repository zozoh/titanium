export default {
  inheritAttrs : false,
  ////////////////////////////////////////////////////
  data : ()=>({
    "inputCompositionstart" : false,
    "isFocused" : false,
    "pointerHover" : null
  }),
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-focused"   : this.isFocused,
        "is-blurred"   : !this.isFocused,
        "is-readonly"  : this.readonly,
        "show-border"  : !this.hideBorder,
        "hide-border"  : this.hideBorder,
        "has-prefix-icon" : this.thePrefixIcon,
        "has-prefix-text" : this.prefixText,
        "has-suffix-icon" : this.suffixIcon,
        "has-suffix-text" : this.suffixText,
      })
    },
    //------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //------------------------------------------------
    TheValue() {
      //console.log("input value:", this.value)
      let val = Ti.Types.toStr(this.value, this.format)
      if(this.autoI18n) {
        return Ti.I18n.text(val)
      }
      return val
    },
    //------------------------------------------------
    ThePrefixIcon() {
      if("prefixIcon" == this.pointerHover
        && this.isCanHover("prefixIcon")) {
        return this.prefixHoverIcon || this.prefixIcon
      }
      return this.prefixIcon
    },
    //------------------------------------------------
    TheHover() {
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
      return this.TheHover[hoverName] ? true : false
    },
    //------------------------------------------------
    getHoverClass(hoverName) {
      let canHover = this.isCanHover(hoverName)
      return {
        "can-hover" : canHover,
        "for-look"  : !canHover,
        "is-prefix-icon-hover" : "prefixIcon" == hoverName
      }
    },
    //------------------------------------------------
    OnInputCompositionStart(){
      this.inputCompositionstart = true
    },
    //------------------------------------------------
    OnInputCompositionEnd(){
      this.inputCompositionstart = false
      this.doWhenInput()
    },
    //------------------------------------------------
    OnInputing($event) {
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
    // OnInputKeyDown($event) {
    //   let payload = _.pick($event, 
    //     "code","key","keyCode",
    //     "altKey","ctrlKey","metaKey","shiftKey")
    //   payload.uniqueKey = Ti.Shortcut.getUniqueKey(payload)
    //   payload.$event = $event
    //   this.$emit("keypress", payload)
    // },
    //------------------------------------------------
    OnInputChanged() {
      this.doWhenInput("change")
    },
    //------------------------------------------------
    OnInputFocus() {
      if(!this.readonly) {
        if(this.autoSelect) {
          this.$refs.input.select()
        } else {
          this.$refs.input.focus()
        }
      }
      this.isFocused = true
      this.$emit("input:focus")
      // Auto Actived
      if(!this.isActived) {
        this.__set_actived()
      }
    },
    //------------------------------------------------
    OnInputBlur() {
      this.isFocused = false
      this.$emit("input:blur")
    },
    //------------------------------------------------
    OnClickPrefixIcon() {
      if(this.prefixIconForClean) {
        this.$emit("change", null)
      }
      this.$emit("prefix:icon")
    },
    //------------------------------------------------
    OnClickPrefixText() {
      this.$emit("prefix:text")
    },
    //------------------------------------------------
    OnClickSuffixIcon() {
      this.$emit("suffix:icon")
    },
    //------------------------------------------------
    OnClickSuffixText() {
      this.$emit("suffix:text")
    },
    //------------------------------------------------
    doAutoFocus() {
      if(this.focused && !this.isFocused) {
        this.OnInputFocus()
      }  
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch : {
    "focused" : function() {
      this.doAutoFocus()
    }
  },
  ////////////////////////////////////////////////////
  mounted : function(){
    this.doAutoFocus()
  }
  ////////////////////////////////////////////////////
}