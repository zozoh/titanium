export default {
  /////////////////////////////////////////
  data: () => ({
    myFormFields: [],
    myCurrentTab: 0
  }),
  /////////////////////////////////////////
  props: {
    "value": {
      type: Object,
      default: undefined
    },
    "fields": {
      type: [Array, String],
      default: undefined
    },
    "fixedKeys": {
      type: Array,
      default: () => ["title", "sort"]
    },
    "fieldStatus": {
      type: Object,
      default: () => ({})
    },
    "preview": {
      type: Object,
      default: () => ({})
    },
    "form": {
      type: Object,
      default: () => ({})
    }
  },
  /////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    isNil() {
      return Ti.Util.isNil(this.value)
    },
    //--------------------------------------
    Layout() {
      return {
        type: "rows",
        border: true,
        blocks: [{
          size: "37%",
          body: "preview",
        }, {
          body: "form"
        }]
      }
    },
    //--------------------------------------
    Schema() {
      return {
        preview: {
          comType: "WnObjPreview",
          comConf: {
            ... this.preview,
            meta: this.value
          }
        },
        form: {
          comType: "TiForm",
          comConf: {
            spacing: "comfy",
            mode: "tab",
            tabAt: "bottom-left",
            ... this.form,
            fields: this.myFormFields,
            fieldStatus: this.fieldStatus,
            currentTab: this.myCurrentTab,
            autoShowBlank: true,
            data: this.value
          }
        }
      }
    }
    //--------------------------------------
  },
  /////////////////////////////////////////
  methods: {
    //--------------------------------------
    async evalObjFormField(fields = this.fields) {
      let reo = await Wn.Obj.genObjFormFields({
        meta: this.value,
        fields,
        currentTab: 0,
        fixedKeys: this.fixedKeys
      })
      this.myCurrentTab = reo.currentTab;
      this.myFormFields = reo.fields
    },
    //--------------------------------------
    async tryEvalObjFormField(newVal, oldVal) {
      if (!_.isEqual(newVal, oldVal)) {
        await this.evalObjFormField(this.fields)
      }
    }
    //--------------------------------------
  },
  /////////////////////////////////////////
  watch: {
    "value": "tryEvalObjFormField",
    "fields": "tryEvalObjFormField"
  },
  /////////////////////////////////////////
  mounted() {
    this.evalObjFormField()
  }
  /////////////////////////////////////////
}