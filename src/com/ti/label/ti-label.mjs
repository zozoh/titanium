const COM_TYPE = "TiLabel";
const _M = {
  //////////////////////////////////////////
  data: () => ({
    isNilDisplay: false,
    myDisplayIcon: undefined,
    myDisplayText: undefined,
    myDictValKey: ".text"
  }),
  //////////////////////////////////////////
  props: {
    "autoLoadDictIcon": {
      type: Boolean,
      default: Ti.Config.getComProp(COM_TYPE, "autoLoadDictIcon", true)
    },
    "valueTip": {
      type: [Boolean, String, Object],
      default: Ti.Config.getComProp(COM_TYPE, "valueTip", false)
    },
    "valueClickable": {
      type: Boolean,
      default: false
    },
    "fullField": {
      type: Boolean,
      default: true
    },
    "multiValSep": {
      type: String,
      default: ", "
    },
    "inDictsplitBy": {
      type: [RegExp, String],
      default: () => /[,;]+/g
    },
    "hoverable": {
      type: Boolean,
      default: false
    },
    "enterNotifyName": {
      type: String,
      default: "enter"
    },
    "leaveNotifyName": {
      type: String,
      default: "leave"
    },
    "hoverNotifyPayload": undefined,
    "cancelClickBubble": false,
    "cancelDblClickBubble": false,
    "hoverCopy": {
      type: Boolean,
      default: undefined
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-nil-display": this.isNilDisplay,
        "is-hover-copy": this.isHoverCopy,
        "is-blank": this.isBlank,
        "is-nowrap": this.valueMaxWidth > 0,
        "full-field": this.fullField
      });
    },
    //--------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width: this.width,
        height: this.height
      });
    },
    //--------------------------------------
    isBlank() {
      if (Ti.Util.isNil(this.value)) {
        return true;
      }
      if (
        _.isDate(this.value) ||
        _.isNumber(this.value) ||
        _.isBoolean(this.value)
      ) {
        return false;
      }
      if (_.isEmpty(this.value)) {
        return true;
      }
      return false;
    },
    //--------------------------------------
    LabelVarText() {
      return JSON.stringify(this.vars || {});
    },
    //--------------------------------------
    LabelValueTip() {
      let tip = this.valueTip;
      if (tip) {
        let re = {
          mode: "V",
          size: "auto",
          type: "secondary",
          contentType: "html",
          text: () => {
            let isComplexObj = false;
            if (_.isArray(this.value)) {
              if (this.value.length > 5) {
                isComplexObj = true;
              } else if (this.value.length >= 1) {
                let it0 = this.value[0];
                if (_.isObject(it0) && _.keys(it0).length > 3) {
                  isComplexObj = true;
                }
              }
            } else if (_.isObject(this.value)) {
              if (_.keys(this.value).length >= 3) {
                isComplexObj = true;
              }
            }
            let val_str;
            if (_.isDate(this.value)) {
              val_str = `Date(${this.value})=${this.value.getTime()}`;
            }
            // complex object
            else if (isComplexObj) {
              val_str = JSON.stringify(this.value, null, "   ");
            }
            // Other Object
            else {
              val_str = JSON.stringify(this.value);
            }

            if (!_.isEmpty(this.vars)) {
              return `<pre>${val_str}
              \n------------ VARS ----------\n${JSON.stringify(
                this.vars,
                null,
                "   "
              )}</pre>`;
            }

            return isComplexObj
              ? `<pre>${val_str}</pre>`
              : `<code>${val_str}</code>`;
          },
          keyboard: "ctrl"
        };
        // Dynamic call tip
        if (_.isFunction(tip)) {
          tip = tip(this);
        }

        if (_.isString(tip)) {
          re.text = tip;
        }
        // Complex tip
        else if (_.isObject(tip)) {
          _.assign(re, tip);
        }

        // Explain it
        let reTip = Ti.Util.explainObj(this, re, { evalFunc: true });
        return Ti.Toptip.toTipBind(reTip);
      }
    },
    //--------------------------------------
    TheFormat() {
      if (this.format) {
        // Customized format
        if (_.isFunction(this.format)) {
          return this.format;
        }
        // Simple format
        if (_.isString(this.format)) {
          if (this.autoI18n) {
            let str = Ti.I18n.text(this.format);
            return (val) => {
              return Ti.S.renderVars(val, str);
            };
          }
          return (val) => {
            return Ti.S.renderVars(val, this.format);
          };
        }
        // Complex format
        if (_.isObject(this.format) && this.format.name) {
          return Ti.Util.genInvoking(this.format, {
            context: this.vars || {},
            partial: "right"
          });
        }
      }
    },
    //--------------------------------------
    ValueStyle() {
      return Ti.Css.toStyle({
        maxWidth: this.valueMaxWidth
      });
    },
    //--------------------------------------
    ThePrefixIcon() {
      if (null === this.prefixIcon) return null;
      return this.myDisplayIcon || this.prefixIcon;
    },
    //--------------------------------------
    ThePrefixText() {
      return Ti.Util.explainObj(this, this.prefixText);
    },
    //--------------------------------------
    TheSuffixText() {
      return Ti.Util.explainObj(this, this.suffixText);
    },
    //--------------------------------------
    TheSuffixIcon() {
      if (this.suffixIcon) {
        return this.suffixIcon;
      }
      if (this.suffixIconForCopy && !this.isNilDisplay) {
        return "far-copy";
      }
    },
    //--------------------------------------
    TheHover() {
      let map = {};
      let hos = _.concat(this.hover);
      for (let ho of hos) {
        if (ho) {
          map[ho] = true;
        }
      }
      return map;
    },
    //--------------------------------------
    TheValue() {
      let str = this.value;
      // Auto trim
      if (this.trim && _.isString(str)) {
        return _.trim(str);
      }
      // Return it directly
      return str;
    },
    //--------------------------------------
    TheHref() {
      if (this.href) {
        let c;
        // Array
        if (_.isArray(this.TheValue)) {
          c = { val: this.TheValue.join(",") };
        }
        // Object
        else if (_.isObject(this.TheValue)) {
          c = _.assign({}, this.TheValue);
        }
        // Take it as simple value
        else {
          c = { val: this.TheValue };
        }
        return Ti.Util.explainObj(c, this.href, {
          evalFunc: true
        });
      }
    },
    //--------------------------------------
    isHoverCopy() {
      if (_.isBoolean(this.hoverCopy)) {
        return this.hoverCopy;
      }
      if (this.Dict || this.suffixIconForCopy || this.isNilDisplay) {
        return false;
      }
      return true;
    },
    //--------------------------------------
    Dict() {
      if (this.dict) {
        // Already Dict
        if (this.dict instanceof Ti.Dict) {
          this.myDictValKey = ".text";
          return this.dict;
        }
        // Get back
        let dictInput = /^(@Dict:|#)$/.test(this.dict)
          ? this.dict
          : `#${this.dict}`;
        return Ti.DictFactory.CreateDictBy(dictInput, {
          vars: this.dictVars,
          callbackValueKey: (vkey) => {
            this.myDictValKey = vKey || ".text";
          }
        });
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnMouseEnter() {
      if (this.hoverable && this.enterNotifyName) {
        let pld = _.assign(
          {
            $el: this.$el,
            value: this.value
          },
          this.hoverNotifyPayload
        );
        this.$notify(this.enterNotifyName, pld);
      }
    },
    //--------------------------------------
    OnMouseLeave() {
      if (this.hoverable && this.leaveNotifyName) {
        let pld = _.assign(
          {
            $el: this.$el,
            value: this.value
          },
          this.hoverNotifyPayload
        );
        this.$notify(this.leaveNotifyName, pld);
      }
    },
    //--------------------------------------
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
    //--------------------------------------
    OnClick(evt) {
      let ck = evt.ctrlKey || evt.metaKey;
      // Cancel bubble
      let cancelBub = Ti.Util.fallback(this.cancelClickBubble, ck, false);
      if (cancelBub) {
        evt.stopPropagation();
      }
      // Copy value
      if (this.isHoverCopy && ck) {
        this.copyValueToClipboard();
      }
    },
    //--------------------------------------
    OnDblClick(evt) {
      let cancelBub = Ti.Util.fallback(
        this.cancelDblClickBubble,
        this.editable,
        false
      );
      if (cancelBub) {
        evt.stopPropagation();
      }
      if (this.editable) {
        Ti.Be.EditIt(this.$el, {
          text: this.TheValue,
          ok: (newVal) => {
            let val = Ti.S.toCase(newVal, this.valueCase);
            this.$notify("change", val);
          }
        });
      }
    },
    //------------------------------------------------
    OnClickLink(evt) {
      console.log(evt);
      if (this.editable || !this.navigable) {
        evt.preventDefault();
      }
      if (this.notifyName) {
        this.$notify(this.notifyName, this.notifyPayload);
      }
    },
    //------------------------------------------------
    OnClickPrefixIcon() {
      this.$notify("prefix:icon", {
        value: this.TheValue
      });
    },
    //------------------------------------------------
    OnClickPrefixText() {
      this.$notify("prefix:text", {
        value: this.TheValue
      });
    },
    //------------------------------------------------
    OnClickValue() {
      if (this.valueClickable) {
        this.$notify("click:value", {
          value: this.TheValue
        });
      }
    },
    //------------------------------------------------
    OnClickSuffixIcon() {
      if (this.suffixIconForCopy) {
        this.copyValueToClipboard();
      }
      // Notify
      else {
        this.$notify("suffix:icon", {
          value: this.TheValue
        });
      }
    },
    //------------------------------------------------
    OnClickSuffixText() {
      this.$notify("suffix:text", {
        value: this.TheValue
      });
    },
    //--------------------------------------
    copyValueToClipboard() {
      let val = this.TheValue;
      Ti.Be.BlinkIt(this.$refs.value);
      Ti.Be.writeToClipboard(val);
    },
    //--------------------------------------
    async evalDisplay(val) {
      if (_.isString(val) && Ti.S.isBlank(val)) {
        this.isNilDisplay = true;
        return Ti.I18n.text(this.placeholder);
      }
      // By Dict Item
      if (this.Dict) {
        // Array value
        if (_.isArray(val)) {
          this.myDisplayIcon = undefined;
          let ss = [];
          for (let v of val) {
            let it = await this.Dict.getItem(v);
            let s = this.Dict.getBy(this.myDictValKey, it, v);
            if (!Ti.Util.isNil(s) || this.valueMustInDict) {
              ss.push(s);
            } else {
              ss.push(v);
            }
          }
          val = ss.join(this.multiValSep);
        }
        // Single value
        else {
          let it = await this.Dict.getItem(val);
          if (it) {
            // It very wierd, somethings this function has been re-enter
            // the Dict will change to undefined here
            if (!this.Dict) {
              return;
            }
            if (this.autoLoadDictIcon) {
              this.myDisplayIcon = this.Dict.getIcon(it);
            }
            let v2 = this.Dict.getBy(this.myDictValKey, it, val);
            if (!Ti.Util.isNil(v2) || this.valueMustInDict) {
              val = v2;
            }
          } else if (this.valueMustInDict) {
            val = null;
            this.myDisplayIcon = null;
          }
        }
      }
      // Test nil display
      this.isNilDisplay = false;
      // Number
      if (_.isNumber(val)) {
        if (this.TheFormat) {
          return Ti.Types.toStr(val, this.TheFormat);
        }
        return val;
      }
      // Collection
      if (_.isArray(val)) {
        if (this.format) {
          let ss = [];
          for (let v of val) {
            // [{...}, {...}]
            if (_.isPlainObject(v)) {
              ss.push(Ti.S.renderBy(this.format, v));
            }
            // ['xxx',  'xxx']
            else {
              ss.push(Ti.S.renderBy(this.format, { val: v }));
            }
          }
          return ss.join(this.multiValSep);
        }
        if (val.length > 1 && (_.isPlainObject(val[0]) || _.isArray(val[0]))) {
          return JSON.stringify(val);
        }
        return val.join(this.multiValSep);
      }
      // Auto format
      if (_.isFunction(this.TheFormat)) {
        let rev = this.TheFormat(val);
        if (Ti.Util.isNil(rev)) {
          this.isNilDisplay = true;
          return Ti.I18n.text(this.placeholder);
        }
        return rev;
      }
      // Object
      if (_.isPlainObject(val)) {
        return JSON.stringify(val, null, "  ");
      }
      // Normal value
      if (Ti.Util.isNil(val)) {
        this.isNilDisplay = true;
        return Ti.I18n.text(this.placeholder);
      }
      // Date
      if (_.isDate(val)) {
        return Ti.Types.toStr(val, this.TheFormat);
      }
      // Return & auto-i18n
      return this.autoI18n ? Ti.I18n.text(val) : val;
    },
    //--------------------------------------
    async reloadMyDisplay() {
      this.myDisplayIcon = null;
      this.myDisplayText = await this.evalDisplay(this.TheValue);
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "value": {
      handler: "reloadMyDisplay",
      immediate: true
    },
    "dict": {
      handler: "reloadMyDisplay"
    }
  }
  //////////////////////////////////////////
};
export default _M;
