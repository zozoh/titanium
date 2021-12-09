const _M = {
  ///////////////////////////////////////////
  data: () => ({
  }),
  ///////////////////////////////////////////
  computed: {
    //--------------------------------------
    GuiExplainContext() {
      return {
        meta: this.meta,
        moduleName: this.moduleName,
        thingSetId: this.thingSetId,
        content: this.content,
        dataHome: this.dataHome,
        dataHomeObj: this.dataHomeObj,
        dataDirName: this.dataDirName,
        dataDirCurrentId: this.dataDirCurrentId,
        dataDirCheckedIds: this.dataDirCheckedIds,
        status: this.status,
        fieldStatus: this.fieldStatus,
      }
    },
    //--------------------------------------
    GuiLayout() {
      let c = this.GuiExplainContext
      return Ti.Util.explainObj(c, this.layout)
    },
    //--------------------------------------
    GuiSchema() {
      let c = this.GuiExplainContext
      let schema = _.omit(this.schema, "components")
      return Ti.Util.explainObj(c, schema)
    },
    //--------------------------------------
    GuiVars() {
      return {}
    },
    //--------------------------------------
    GuiShown() {
      return {}
    },
    //--------------------------------------
    GuiLoadingAs() {
      return {
        "reloading": {
          icon: "fas-spinner fa-spin",
          text: "i18n:loading"
        },
        "doing": {
          icon: "zmdi-settings fa-spin",
          text: "i18n:doing"
        },
        "saving": {
          icon: "zmdi-settings fa-spin",
          text: "i18n:saving"
        },
        "deleting": {
          icon: "zmdi-refresh fa-spin",
          text: "i18n:del-ing"
        },
        "publishing": {
          icon: "zmdi-settings zmdi-hc-spin",
          text: "i18n:publishing"
        },
        "restoring": {
          icon: "zmdi-time-restore zmdi-hc-spin",
          text: "i18n:thing-restoring"
        },
        "cleaning": {
          icon: "zmdi-settings zmdi-hc-spin",
          text: "i18n:thing-cleaning"
        }
      }
    },
    //--------------------------------------
    GuiIsLoading() {
      return false
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods: {

  }
  ///////////////////////////////////////////
}
export default _M;