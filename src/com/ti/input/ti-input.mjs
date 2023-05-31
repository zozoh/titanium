const _M = {
  ////////////////////////////////////////////////////
  model: {
    prop: "value",
    event: "change"
  },
  ////////////////////////////////////////////////////
  data: () => ({
    inputCompositionstart: false,
    isFocused: false,
    pointerHover: null,
    inputingValue: undefined
  }),
  ////////////////////////////////////////////////////
  props: {
    "focusValue": {
      type: [String, Number]
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      let hasWidth = !Ti.Util.isNil(this.width);
      return this.getTopClass({
        "is-focused": this.isFocused,
        "is-blurred": !this.isFocused,
        "is-readonly": this.readonly,
        "no-readonly": !this.readonly,
        "show-border": !this.hideBorder,
        "hide-border": this.hideBorder,
        "has-width": hasWidth,
        "nil-width": !hasWidth,
        "full-field": !hasWidth,
        "has-prefix-icon": this.prefixIcon ? true : false,
        "has-prefix-text": !Ti.Util.isNil(this.prefixText),
        "has-suffix-icon": this.suffixIcon ? true : false,
        "has-suffix-text": !Ti.Util.isNil(this.suffixText)
      });
    },
    //------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      });
    },
    //------------------------------------------------
    InputValueTip() {
      let tip = this.valueTip;
      if (this.valueTip) {
        if (_.isString(this.valueTip)) {
          return {
            "data-ti-tip": this.valueTip
          };
        }
      }
      return tip;
    },
    //------------------------------------------------
    TheValue() {
      if (!_.isUndefined(this.inputingValue)) {
        return this.inputingValue;
      }
      //console.log("input value:", this.value)
      let val = this.value;
      if (this.isFocused && !Ti.Util.isNil(this.focusValue)) {
        val = this.focusValue;
      }
      val = Ti.Types.toStr(val, this.format);
      if (this.autoI18n) {
        return Ti.I18n.text(val);
      }
      return val;
    },

    //------------------------------------------------
    ThePrefixIcon() {
      let icon = Ti.Util.trueGet(
        this.prefixIcon,
        "zmdi-close",
        this.prefixIcon
      );
      let hove = this.prefixHoverIcon;
      if ("prefixIcon" == this.pointerHover && this.isCanHover("prefixIcon")) {
        return hove || icon;
      }
      return icon;
    },
    //--------------------------------------
    ThePrefixText() {
      return Ti.Util.explainObj(this, this.prefixText);
    },
    //--------------------------------------
    TheSuffixText() {
      return Ti.Util.explainObj(this, this.suffixText);
    },
    //------------------------------------------------
    TheHover() {
      let map = {};
      let hos = _.concat(this.hover);
      for (let ho of hos) {
        if (ho) {
          map[ho] = true;
        }
      }
      return map;
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    isCanHover(hoverName) {
      return this.TheHover[hoverName] ? true : false;
    },
    //------------------------------------------------
    getHoverClass(hoverName) {
      let canHover = this.isCanHover(hoverName);
      return {
        "can-hover": canHover,
        "for-look": !canHover,
        "is-prefix-icon-hover": "prefixIcon" == hoverName
      };
    },
    //------------------------------------------------
    OnInputCompositionStart() {
      this.inputCompositionstart = true;
    },
    //------------------------------------------------
    OnInputCompositionEnd() {
      this.inputCompositionstart = false;
      this.doWhenInput();
    },
    //------------------------------------------------
    OnInputing($event) {
      if (!this.inputCompositionstart) {
        this.doWhenInput();
      }
    },
    //------------------------------------------------
    doWhenInput() {
      let val = this.getInputValue(false);
      if (!Ti.Util.isNil(val)) {
        this.inputingValue = val;
        this.$notify("inputing", val);
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
      //console.log("OnInputChanged");
      let val = this.getInputValue(this.autoJsValue);
      // validate
      let checker = this.genValidating();
      if (!checker(val)) {
        this.$notify("invalid", val);
        return;
      }
      //console.log("OnInputChange", JSON.stringify(val))
      this.$notify("change", val);
      _.delay(() => {
        this.inputingValue = undefined;
      }, 100);
    },
    //------------------------------------------------
    OnClickInput() {
      if (!this.readonly) {
        this.isFocused = true;
      }
      if (!this.isActived) {
        this.setActived();
      }
      this.$notify("input:click");
    },
    //------------------------------------------------
    OnInputFocus() {
      if (this.readonly) return;
      if (this.autoSelect) {
        this.$refs.input.select();
      } else {
        this.$refs.input.focus();
      }
      this.isFocused = true;
      this.$notify("input:focus");
      // Auto Actived
      if (!this.isActived) {
        this.setActived();
      }
    },
    //------------------------------------------------
    OnInputBlur() {
      this.isFocused = false;
      this.$notify("input:blur");
    },
    //------------------------------------------------
    OnClickPrefixIcon() {
      if (this.prefixIconForClean) {
        this.$notify("change", null);
      }
      if (this.prefixIconNotifyName) this.$notify(this.prefixIconNotifyName);
    },
    //------------------------------------------------
    OnClickPrefixText() {
      if (this.prefixTextNotifyName) this.$notify(this.prefixTextNotifyName);
    },
    //------------------------------------------------
    OnClickSuffixIcon() {
      if (this.suffixIconNotifyName) {
        this.$notify(this.suffixIconNotifyName);
      }
    },
    //------------------------------------------------
    OnClickSuffixText() {
      //console.log("suffix")
      if (this.suffixTextNotifyName) this.$notify(this.suffixTextNotifyName);
    },
    //------------------------------------------------
    OnInputKeyPress($event) {
      if (13 == $event.which) {
        if (this.enterKeyNotifyName) {
          let val = this.getInputValue(this.autoJsValue);
          this.$notify(this.enterKeyNotifyName, val);
        }
      }
    },
    //------------------------------------------------
    // Utility
    //------------------------------------------------
    getInputValue(autoJsValue = false) {
      if (_.isElement(this.$refs.input)) {
        //console.log("doWhenInput", emitName)
        let val = this.$refs.input.value;
        // Auto js value
        if (autoJsValue) {
          val = Ti.S.toJsValue(val, {
            autoNil: true,
            autoDate: false,
            trimed: this.trimed
          });
        }
        // Keep value as string
        else {
          // Trim
          if (this.trimed) {
            val = _.trim(val);
          }
          // emptyAsNull
          if (this.emptyAsNull && !val) {
            val = null;
          }
        }
        // case
        if (this.valueCase) {
          val = Ti.S.toCase(val, this.valueCase);
        }

        // notify
        return val;
      }
    },
    //------------------------------------------------
    genValidating() {
      if (this.validator) {
        let { test, message } = this.validator;
        if (test) {
          let am = Ti.AutoMatch.parse(test);
          return (v) => {
            if (!am(v)) {
              Ti.Toast.Open(message || "i18n:invalid-val", "warn");
              return false;
            }
            return true;
          };
        }
      }
      return (v) => true;
    },
    //------------------------------------------------
    doAutoFocus() {
      if (this.focused && !this.isFocused) {
        this.OnInputFocus();
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    "focused": "doAutoFocus"
  },
  ////////////////////////////////////////////////////
  mounted: function () {
    this.doAutoFocus();
  }
  ////////////////////////////////////////////////////
};
export default _M;
