const _M = {
  ///////////////////////////////////////////
  data: () => ({}),
  ///////////////////////////////////////////
  computed: {
    //--------------------------------------
    GuiExplainContext() {
      return {
        moduleName: this.moduleName,
        rootState: this.rootState,
        //------------------------------
        thingSetId: this.thingSetId,
        oTs: this.oTs,
        //------------------------------
        load: this.load,
        //------------------------------
        aggQuery: this.aggQuery,
        agg: this.agg,
        aggResult: this.aggResult,
        fixedMatch: this.fixedMatch,
        filter: this.filter,
        sorter: this.sorter,
        list: this.list,
        currentId: this.currentId,
        checkedIds: this.checkedIds,
        pager: this.pager,
        //------------------------------
        meta: this.meta,
        content: this.content,
        contentData: this.contentData,
        //------------------------------
        dataDirFiles: this.dataDirFiles,
        dataHome: this.dataHome,
        dataHomeObj: this.dataHomeObj,
        dataDirName: this.dataDirName,
        dataDirCurrentId: this.dataDirCurrentId,
        dataDirCheckedIds: this.dataDirCheckedIds,
        //------------------------------
        status: this.status,
        fieldStatus: this.fieldStatus,
        //------------------------------
        viewType: this.viewType,
        exposeHidden: this.exposeHidden,
        //------------------------------
        methods: this.thingMethods,
        //------------------------------
        // Adapte old thing set data model
        //------------------------------
        currentDataHome: this.dataHome,
        currentDataHomeObj: this.dataHomeObj,
        currentDataDirName: this.dataDirName,
        //------------------------------
        ...this.getters,
      };
    },
    //--------------------------------------
    GuiLayout() {
      let c = this.GuiExplainContext;
      return Ti.Util.explainObj(c, this.layout);
    },
    //--------------------------------------
    GuiSchema() {
      let c = this.GuiExplainContext;
      let schema = _.omit(
        this.schema,
        "components",
        "events",
        "behavior",
        "methods"
      );
      return Ti.Util.explainObj(c, schema);
    },
    //--------------------------------------
    GuiVars() {
      return {};
    },
    //--------------------------------------
    GuiLoadingAs() {
      return {
        "reloading": {
          icon: "fas-spinner fa-spin",
          text: "i18n:loading",
        },
        "doing": {
          icon: "zmdi-settings fa-spin",
          text: "i18n:doing",
        },
        "saving": {
          icon: "zmdi-settings fa-spin",
          text: "i18n:saving",
        },
        "deleting": {
          icon: "zmdi-refresh fa-spin",
          text: "i18n:del-ing",
        },
        "publishing": {
          icon: "zmdi-settings zmdi-hc-spin",
          text: "i18n:publishing",
        },
        "restoring": {
          icon: "zmdi-time-restore zmdi-hc-spin",
          text: "i18n:thing-restoring",
        },
        "cleaning": {
          icon: "zmdi-settings zmdi-hc-spin",
          text: "i18n:thing-cleaning",
        },
      };
    },
    //--------------------------------------
    GuiIsLoading() {
      return this.status.reloading ||
        this.status.doing ||
        this.status.saving ||
        this.status.deleting ||
        this.status.publishing ||
        this.status.restoring ||
        this.status.cleaning
        ? true
        : false;
    },
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods: {},
  ///////////////////////////////////////////
};
export default _M;
