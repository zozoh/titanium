export default {
  //////////////////////////////////////////
  data: () => ({

  }),
  //////////////////////////////////////////
  props: {
    "value": null,
    "valueType": {
      type: String,
      default: "Nil"
    },
    "valuePath": {
      type: [String, Array],
      default: () => []
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return Ti.Css.mergeClassName({
        "is-self-actived": this.isSelfActived,
        "is-actived": this.isActived
      })
    },
    //--------------------------------------
    isLabel() {
      return /^(Array|Object)$/.test(this.valueType)
    },
    //--------------------------------------
    isTop() {
      return this.theValuePath.length == 0
    },
    //--------------------------------------
    theLabelDisplayText() {
      if ('Array' == this.valueType) {
        return '[..]'
      }
      if ('Object' == this.valueType) {
        return '{..}'
      }
      return '???'
    },
    //--------------------------------------
    theValuePath() {
      if (_.isArray(this.valuePath)) {
        return this.valuePath
      }
      if (_.isString(this.valuePath)) {
        return _.without(this.valuePath.split(/[\/.]/g), "")
      }
      return []
    },
    //--------------------------------------
    theValueClassName() {
      return _.kebabCase(`is${this.valueType}`)
    },
    //--------------------------------------
    theValueFormat() {
      if ('String' == this.valueType) {
        return function (val) {
          if (val) {
            return `"${val}"`
          }
          return '""'
        }
      }
    },
    //--------------------------------------
    theActionMenuData() {
      //................................
      let jvTypes = [{
        name: "jvTypeArray",
        text: "i18n:json-Array",
        type: "action",
        altDisplay: {
          icon: "zmdi-check",
          capture: false
        },
        action: () => {
          this.$notify("change", { jsonMutate: "ChangeValueType", args: "Array" })
        }
      }, {
        name: "jvTypeObject",
        text: "i18n:json-Object",
        type: "action",
        altDisplay: {
          icon: "zmdi-check",
          capture: false
        },
        action: () => {
          this.$notify("change", { jsonMutate: "ChangeValueType", args: "Object" })
        }
      }]
      //................................
      // Add
      let menuData = [{
        name: "jv-add",
        type: "action",
        icon: "zmdi-plus",
        action: () => {
          this.$notify("change", { jsonMutate: "Add" })
        }
      }]
      //................................
      // Remove : If not the top
      if (!this.isTop) {
        menuData.push({
          type: "line"
        })
        // Can not remove top node
        menuData.push({
          name: "jv-remove",
          type: "action",
          icon: "zmdi-delete",
          action: () => {
            this.$notify("change", { jsonMutate: "Remove" })
          }
        })
        // Add More Types
        jvTypes.push({})

        // AddType: Boolean
        jvTypes.push({
          name: "jvTypeBoolean",
          text: "i18n:json-Boolean",
          type: "action",
          altDisplay: {
            icon: "zmdi-check",
            capture: false
          },
          action: () => {
            this.$notify("change", { jsonMutate: "ChangeValueType", args: "Boolean" })
          }
        })
        // AddType: Number
        jvTypes.push({
          name: "jvTypeNumber",
          text: "i18n:json-Number",
          type: "action",
          altDisplay: {
            icon: "zmdi-check",
            capture: false
          },
          action: () => {
            this.$notify("change", { jsonMutate: "ChangeValueType", args: "Number" })
          }
        })
        // AddType: String
        jvTypes.push({
          name: "jvTypeString",
          text: "i18n:json-String",
          type: "action",
          altDisplay: {
            icon: "zmdi-check",
            capture: false
          },
          action: () => {
            this.$notify("change", { jsonMutate: "ChangeValueType", args: "String" })
          }
        })
        // AddType: Nil
        jvTypes.push({
          name: "jvTypeNil",
          text: "i18n:json-Nil",
          type: "action",
          altDisplay: {
            icon: "zmdi-check",
            capture: false
          },
          action: () => {
            this.$notify("change", { jsonMutate: "ChangeValueType", args: "Nil" })
          }
        })
      }
      //................................
      // More: Change Type
      menuData.push({})
      menuData.push({
        key: "jv-types",
        type: "group",
        icon: "zmdi-more",
        items: jvTypes
      })
      // Done
      return menuData
    },
    //--------------------------------------
    theActionMenuStatus() {
      return {
        jvTypeBoolean: "Boolean" == this.valueType,
        jvTypeInteger: "Integer" == this.valueType,
        jvTypeFloat: "Float" == this.valueType,
        jvTypeNumber: "Number" == this.valueType,
        jvTypeString: "String" == this.valueType,
        jvTypeArray: "Array" == this.valueType,
        jvTypeObject: "Object" == this.valueType,
        jvTypeNil: "Nil" == this.valueType
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------

    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {

  },
  //////////////////////////////////////////
  mounted: function () {

  }
  //////////////////////////////////////////
}