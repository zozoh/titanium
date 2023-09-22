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
    TopClass() {
      return {
        "is-creating": this.creating
      };
    },
    //--------------------------------------
    TheData() {
      return this.myData || this.data;
    },
    //--------------------------------------
    TheForm() {
      return _.assign(
        {
          className: "ti-fill-parent",
          onlyFields: false,
          adjustDelay: 1,
          fields: this.fields,
          fixed: this.fixed,
          canSubmit: true,
          submitButton: {
            className: "btn-r8 is-big",
            text: "i18n:create-now"
          }
        },
        this.form
      );
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnFormInit($form) {
      this.$form = $form;
    },
    //--------------------------------------
    OnFormFieldChange({ name, value } = {}) {
      //console.log("OnFormFieldChange", pair)
      let data = Ti.Types.toObjByPair({ name, value });
      this.myData = _.assign({}, this.myData, data);
    },
    //--------------------------------------
    OnFormChange(data) {
      //console.log("OnFormChange", data)
      this.myData = data;
    },
    //--------------------------------------
    // Can be use in WnThAdaptor or the old [WnThingManager]
    async OnCreate() {
      this.creating = true;
      let reo;
      let $ThP = this.tiParentCom("WnThAdaptor");
      if (!$ThP) {
        $ThP = this.tiParentCom("WnThingManager");
      }
      reo = await $ThP.dispatch("create", this.myData);
      this.creating = false;
      if (reo && !(reo instanceof Error)) {
        this.$notify("block:hide", "creator");
      }
    },
    //--------------------------------------
    async OnSubmit() {
      this.$nextTick(() => {
        this.OnCreate();
      });
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  mounted() {
    this.myData = _.cloneDeep(this.data);
  }
  ///////////////////////////////////////////
};
