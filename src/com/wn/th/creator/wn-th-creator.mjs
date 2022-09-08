export default {
  ///////////////////////////////////////////
  data: () => ({
    "myData": undefined,
    "creating": false
  }),
  ///////////////////////////////////////////
  props: {
    "fields": {
      type: Array,
      default: () => []
    },
    "data": {
      type: Object,
      default: () => ({})
    },
    "formType": {
      type: String,
      default: "TiForm"
    },
    "form": {
      type: Object,
      default: () => ({})
    },
    "fixed": {
      type: Object,
      default: undefined
    }
  },
  ///////////////////////////////////////////
  computed: {
    //--------------------------------------
    TheData() {
      return this.myData || this.data
    },
    //--------------------------------------
    TheForm() {
      return _.assign({
        className: "ti-fill-parent",
        onlyFields: false,
        adjustDelay: 1,
        fields: this.fields,
        fixed: this.fixed,
        actionButtonSetup: [
          {
            className: "btn-r8 is-big",
            text: "i18n:create-now",
            handler: () => {
              this.OnCreate()
            }
          }
        ]
      }, this.form)
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnFormInit($form) {
      this.$form = $form
    },
    //--------------------------------------
    OnFormFieldChange(pair = {}) {
      //console.log("OnFormFieldChange", pair)
      this.myData = this.$form.getData(pair)
    },
    //--------------------------------------
    OnFormChange(data) {
      //console.log("OnFormChange", data)
      this.myData = data
    },
    //--------------------------------------
    // Can be use in WnThAdaptor or the old [WnThingManager]
    async OnCreate() {
      this.creating = true
      let reo;
      let $ThP = this.tiParentCom("WnThAdaptor")
      if (!$ThP) {
        $ThP = this.tiParentCom("WnThingManager")
      }
      reo = await $ThP.dispatch("create", this.myData)
      this.creating = false
      if (reo && !(reo instanceof Error)) {
        this.$notify("block:hide", "creator")
      }
    },
    //--------------------------------------
    async OnSubmit() {
      this.$nextTick(() => {
        this.OnCreate()
      })
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  mounted() {
    this.myData = this.$form.getData()
  }
  ///////////////////////////////////////////
}