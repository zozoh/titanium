export default {
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "value": {
      type: Array,
      default: () => []
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "dialog": {
      type: [Object, Array],
      default: () => ({
        title: "i18n:edit",
        width: 500,
        height: 500
      })
    },
    "formIconComConf": {
      type: Object,
      default: () => ({})
    },
    "formTextField": {
      type: Object,
      default: () => ({})
    },
    "formValueField": {
      type: Object,
      default: () => ({})
    },
    //------------------------------------------------
    // Aspect
    //------------------------------------------------
    "blankAs": {
      type: Object
    },
    "actionAlign": {
      type: String,
      default: undefined
    },
    "newItemIcon": {
      type: String,
      default: "fas-plus"
    },
    "newItemText": {
      type: String,
      default: "i18n:new-item"
    },
    "itemEditable": {
      type: Boolean,
      default: true
    },
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    ListComConf() {
      let fields = [
        {
          "title": "i18n:title",
          "display": [
            "<icon>?",
            "text"
          ]
        },
        {
          "title": "i18n:value",
          "display": "value::as-tip flex-none"
        }
      ]

      return {
        dftLabelHoverCopy: false,
        columnResizable: true,
        canCustomizedFields: true,
        fields
      }
    },
    //------------------------------------------------
    FormComConf() {
      let fields = [
        {
          "title": "i18n:icon",
          "name": "icon",
          "comType": "TiInputIcon",
          "comConf": this.formIconComConf
        },
        {
          "title": "i18n:title",
          "name": "text",
          ..._.assign({
            type: "String",
            comType: "TiInput",
            comConf: {}
          }, this.formTextField)
        },
        {
          "title": "i18n:value",
          "name": "value",
          ..._.assign({
            type: "String",
            comType: "TiInput",
            comConf: {}
          }, this.formValueField)
        }
      ]

      return { gridColumnHint: 1, fields }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}