export default {
  ///////////////////////////////////////////////////////
  data: () => ({
    myValue: null
  }),
  ///////////////////////////////////////////////////////
  props: {
    // If image, join the base
    "base": {
      type: String,
      default: null
    },
    "value": {
      type: [String, Object, Number],
      default: null
    },
    "dict": {
      type: [String, Ti.Dict],
      default: null
    },
    "defaultValue": {
      type: [String, Object],
      default: null
    },
    "fontSize": {
      type: [Number, String],
      default: null
    },
    "width": {
      type: [Number, String],
      default: null
    },
    "height": {
      type: [Number, String],
      default: null
    },
    "color": {
      type: [String, Function],
      default: ""
    },
    "opacity": {
      type: [Number, Function],
      default: -1
    },
    "notifyName": {
      type: String,
      default: undefined
    },
    "notifyConf": {
      type: [Object, String, Number, Boolean, Array],
      default: undefined
    },
    "stopPropagation": {
      type: Boolean,
      default: false
    }
  },
  ///////////////////////////////////////////////////////
  computed: {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass({
        "can-click": this.notifyName ? true : false
      }, `is-${this.Icon.type}`, this.Icon.iconClass)
    },
    //---------------------------------------------------
    Dict() {
      if (this.dict) {
        // Already Dict
        if (this.dict instanceof Ti.Dict) {
          return this.dict
        }
        // Get back
        let { name } = Ti.DictFactory.explainDictName(this.dict)
        return Ti.DictFactory.CheckDict(name)
      }
    },
    //---------------------------------------------------
    // formed icon data
    Icon() {
      let icn
      if (_.isPlainObject(this.myValue)) {
        // Regular icon object, return it directly
        if (this.myValue.value) {
          icn = _.cloneDeep(this.myValue)
        }
        // Eval it as meta
        else {
          icn = {
            type: "font",
            value: Ti.Icons.get(this.myValue)
          }
        }
        // Auto type
        if (!icn.type) {
          icn.type = /(jpe?g|gif|png|svg)$/i.test(icn.value)
            ? "image"
            : "font"
        }
      }
      // String
      else {
        icn = {
          type: "font",
          value: this.myValue
        }
        if (_.isString(this.myValue)) {
          icn.type = Ti.Util.getSuffixName(this.myValue) || "font"
        }
        // for image
        if (/^(jpe?g|gif|png|svg)$/i.test(icn.type)) {
          icn.type = "image"
        }
      }

      // Join `className / text` to show icon font
      if ('font' == icn.type) {
        let iconClass = icn.className
        let val = Ti.Icons.getByName(icn.value, icn.value)
        _.assign(icn, Ti.Icons.parseFontIcon(val), {
          iconClass, iconClass
        })
      }
      // Join base
      else if ('image' == icn.type) {
        if (!Ti.Util.isBlank(this.base)) {
          icn.value = Ti.Util.appendPath(this.base, icn.value)
        }
      }

      // Evel the color
      let color = icn.color || this.color
      if (_.isFunction(color)) {
        color = color(this.value)
      }

      // Evel the opacity
      let opacity = icn.opacity || this.opacity
      if (_.isFunction(opacity)) {
        opacity = opacity(this.value)
      }
      if (!_.isNumber(opacity) || opacity < 0) {
        opacity = undefined
      }


      // join style:outer
      let width = icn.width || this.width
      let height = icn.height || this.height
      icn.outerStyle = Ti.Css.toStyle({
        width, height,
        color, opacity
      })

      // join style:inner
      if ('image' == icn.type) {
        icn.innerStyle = {
          "width": width ? "100%" : undefined,
          "height": height ? "100%" : undefined
        }
      }
      // font size
      else if ('font' == icn.type) {
        let fsz = icn.fontSize || this.fontSize
        icn.innerStyle = {
          "font-size": Ti.Css.toSize(fsz)
        }
      }

      return icn
    },
    //---------------------------------------------------
  },
  methods: {
    //---------------------------------------------------
    OnClickTop($event) {
      if(this.stopPropagation) {
        $event.stopPropagation()
      }
      if (this.notifyName) {
        this.$notify(this.notifyName, this.notifyConf)
      }
    },
    //---------------------------------------------------
    async evalMyValue() {
      let val = Ti.Util.fallbackNil(this.value, this.defaultValue)
      // Translate by dict
      if (this.Dict) {
        this.myValue = await this.Dict.getItemIcon(val)
      }
      // Normal value
      else {
        this.myValue = val
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch: {
    "value": {
      handler: "evalMyValue",
      immediate: true
    }
  }
  ///////////////////////////////////////////////////////
}