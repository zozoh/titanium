const _M = {
  //////////////////////////////////////////
  props: {
    "tabAt": {
      type: String,
      default: "bottom-left",
      validator: (v) => /^(top|bottom)-(left|center|right)$/.test(v)
    },
    "value": undefined,
    "valueType": {
      type: String,
      default: "text",
      validator: v => /^(text|obj)$/.test(v)
    },
    "jsonIndent": {
      type: String,
      default: '   '
    },
    "tree": {
      type: Object,
      default: () => ({})
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TheData() {
      if (!Ti.Util.isNil(this.value)) {
        if (_.isString(this.value)) {
          return Ti.Types.safeParseJson(this.value, Ti.Err.make("e.json.syntax"))
        }
        return this.value
      }
      return null
    },
    //--------------------------------------
    isSyntaxError() {
      return this.TheData instanceof Error
    },
    //--------------------------------------
    TheSource() {
      if (!Ti.Util.isNil(this.value)) {
        if (_.isString(this.value)) {
          return this.value
        }
        return JSON.stringify(this.value)
      }
      return ""
    },
    //--------------------------------------
    TheLayout() {
      return {
        type: "tabs",
        tabAt: this.tabAt,
        blocks: [{
          title: "i18n:structure",
          name: "tree",
          body: "desktop-tree"
        }, {
          title: "i18n:source-code",
          name: "source",
          body: "desktop-source"
        }]
      }
    },
    //--------------------------------------
    TheSchema() {
      //....................................
      // Source Conf
      let desktopTree;
      if (this.isSyntaxError) {
        desktopTree = {
          comType: "ti-loading",
          comConf: {
            className: "is-error",
            icon: "im-warning",
            text: "i18n:json-syntax-err-tip"
          }
        }
      }
      //
      else {
        desktopTree = {
          comType: "ti-text-json-tree",
          comConf: _.assign({}, this.tree, {
            value: this.TheData
          })
        }
      }
      //....................................
      // Done
      return {
        "desktop-tree": desktopTree,
        "desktop-source": {
          comType: "ti-text-raw",
          comConf: {
            showTitle: false,
            value: this.TheSource
          }
        }
      }
      //....................................
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnChange(payload) {
      //console.log("TiObjJson->OnChange", payload)
      if ("obj" == this.valueType) {
        if (_.isString(payload)) {
          try {
            payload = JSON.parse(payload)
          } catch (E) {
            return
          }
        }
        this.$notify("change", payload)
      }
      // Pure text
      else {
        payload = Ti.Util.fallback(payload, null)
        if(!_.isString(payload)) {
          payload = JSON.stringify(payload, null, '  ')
        }
        this.$notify('change', payload)
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;