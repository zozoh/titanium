//////////////////////////////////////////////////////
export default {
  ////////////////////////////////////////////////////
  data: () => ({
    // Keep last search {input, command}
    // to avoid the multi-search
    myLastSearch: undefined,

    myLoading: false,
    myFilter: {},
    mySorter: {},
    myList: [],
    myPager: {},
  }),
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    tsPath: {
      type: String,
    },
    fixedMatch: {
      type: Object,
    },
    //------------------------------------------------
    // Behavior
    //------------------------------------------------
    localKeepAt: {
      type: String,
    },
  },
  ////////////////////////////////////////////////////
  computed: {
    //--------------------------------------------
    isPagerEnabled() {
      if (!this.myPager) {
        return false;
      }
      if (!(this.SearchPageNumber > 0)) {
        return false;
      }
      if (!(this.SearchPageSize > 0)) {
        return false;
      }
      return true;
    },
    //--------------------------------------------
    SearchPageNumber() {
      if (this.pagerValueType == "shortName") {
        return _.get(this.myPager, "pn");
      }
      return _.get(this.myPager, "pageNumber");
    },
    //--------------------------------------------
    SearchPageSize() {
      if (this.pagerValueType == "shortName") {
        return _.get(this.myPager, "pgsz");
      }
      return _.get(this.myPager, "pageSize");
    },
    //------------------------------------------------
    SearchInput() {
      // Guard
      if (Ti.S.isBlank(this.tsPath)) {
        return;
      }

      // Eval the filter
      let filter = _.cloneDeep(this.myFilter);
      let fixedMatch = _.cloneDeep(this.fixedMatch);
      return JSON.stringify(_.assign({}, filter, fixedMatch));
    },
    //------------------------------------------------
    SearchCommand() {
      // Guard
      if (Ti.S.isBlank(this.tsPath)) {
        return;
      }

      // Command
      let cmds = [`thing ${this.tsPath} query -cqn`];

      // Eval Pager
      if (this.isPagerEnabled) {
        let limit = this.SearchPageSize * 1;
        let skip = this.SearchPageSize * (this.SearchPageNumber - 1);
        cmds.push(`-pager -limit ${limit} -skip ${skip}`);
      }

      // Sorter
      if (!_.isEmpty(this.mySorter)) {
        cmds.push(`-sort '${JSON.stringify(this.mySorter)}'`);
      }

      // Show Thing Keys
      if (this.objKeys) {
        cmds.push(`-e '${this.objKeys}'`);
      }

      // Done
      return cmds.join(" ");
    },
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    OnFilterChange(payload) {
      this.myFilter = payload;
      _.assign(this.myPager, {
        pn: 1,
        pageNumber: 1,
      });
      this.saveToLocal();
    },
    //------------------------------------------------
    OnSorterChange(payload) {
      this.mySorter = payload;
      this.saveToLocal();
    },
    //------------------------------------------------
    OnPagerChange(payload) {
      this.myPager = _.assign({}, this.myPager, payload);
      this.saveToLocal();
    },
    //------------------------------------------------
    saveToLocal() {
      if (this.localKeepAt) {
        let filter = this.myFilter;
        let sorter = this.mySorter;
        let pager = _.pick(
          this.myPager,
          "pn",
          "pgsz",
          "pageNumber",
          "pageSize"
        );
        Ti.Storage.local.setObject(this.localKeepAt, {
          filter,
          sorter,
          pager,
        });
      }
    },
    //------------------------------------------------
    restoreFromLocal() {
      if (this.localKeepAt) {
        let reo = Ti.Storage.local.getObject(this.localKeepAt) || {};
        let { filter, sorter, pager } = reo;
        this.myFilter = filter;
        this.mySorter = sorter;
        this.myPager = _.assign({}, this.pager, pager);
      }
    },
    //------------------------------------------------
    buildLastSearch() {
      return {
        input: this.SearchInput,
        command: this.SearchCommand,
      };
    },
    //------------------------------------------------
    async reloadList() {
      this.myLastSearch = this.buildLastSearch();
      let cmdText = this.SearchCommand;
      let input = this.SearchInput;
      //console.log("WnThSearch.reloadList", cmdText, "<FLT>", input)

      this.myLoading = true;

      let reo = await Wn.Sys.exec2(cmdText, { input, as: "json" });

      // Update pager
      if (this.isPagerEnabled) {
        this.myPager = _.assign({}, this.myPager, reo.pager);
        this.myList = reo.list;
      }
      // List all
      else {
        this.myList = reo;
      }

      this.myLoading = false;
    },
    //------------------------------------------------
    tryReloadList() {
      let lastSearch = this.buildLastSearch();
      if (!_.isEqual(lastSearch, this.myLastSearch)) {
        this.reloadList();
      }
    },
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    SearchInput: "tryReloadList",
    SearchCommand: "tryReloadList",
    filter: {
      handler: function (newVal) {
        this.myFilter = _.cloneDeep(newVal || {});
      },
      immediate: true,
    },
    sorter: {
      handler: function (newVal) {
        this.mySorter = _.cloneDeep(newVal || {});
      },
      immediate: true,
    },
    pager: {
      handler: function (newVal) {
        this.myPager = _.cloneDeep(newVal || {});
      },
      immediate: true,
    },
  },
  ////////////////////////////////////////////////////
  created() {
    this.restoreFromLocal();
  },
  ////////////////////////////////////////////////////
  mounted() {
    this.tryReloadList();
  },
  ////////////////////////////////////////////////////
};
