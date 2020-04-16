export default {
  ////////////////////////////////////////////////////
  model : {
    prop : "value",
    event: "change"
  },
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
    doWhenInput(emitName="inputing", autoJsValue=false) {
      if(_.isElement(this.$refs.input)) {
        //console.log("doWhenInput", emitName)
        let val = this.$refs.input.value
        // Auto js value
        if(autoJsValue) {
          val = Ti.S.toJsValue(val, {
            autoNil  : true,
            autoDate : false,
            trimed : this.trimed
          })
        }
        // Trim
        else if(this.trimed) {
          val = _.trim(val)
        }
        // case
        val = Ti.S.toCase(val, this.valueCase)
        // notify
        this.$notify(emitName, val)
      }
    },
    //------------------------------------------------
    // OnInputKeyDown($event) {
    //   let payload = _.pick($event, 
    //     "code","key","keyCode",
    //     "altKey","ctrlKey","metaKey","shiftKey")
    //   payload.uniqueKey = Ti.Shortcut.getUniqueKey(payload)
    //   payload.$event = $event
    //   this.$notify("keypress", payload)
    // },
    //------------------------------------------------
    OnInputChanged() {
      this.doWhenInput("change", this.autoJsValue)
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
      this.$notify("input:focus")
      // Auto Actived
      if(!this.isActived) {
        this.setActived()
      }
    },
    //------------------------------------------------
    OnInputBlur() {
      this.isFocused = false
      this.$notify("input:blur")
    },
    //------------------------------------------------
    OnClickPrefixIcon() {
      if(this.prefixIconForClean) {
        this.$notify("change", null)
      }
      this.$notify("prefix:icon")
    },
    //------------------------------------------------
    OnClickPrefixText() {
      this.$notify("prefix:text")
    },
    //------------------------------------------------
    OnClickSuffixIcon() {
      this.$notify("suffix:icon")
    },
    //------------------------------------------------
    OnClickSuffixText() {
      this.$notify("suffix:text")
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