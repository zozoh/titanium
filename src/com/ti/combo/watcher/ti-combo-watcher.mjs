const _M = {
  ////////////////////////////////////////////////////
  data: () => ({
    $sortable: undefined,
    dragging: false,
    myTabSet: {
      /*
      _current: "TabName",
      "TabName": {filter:{..}, sorter:{..}}      
    */
    }
  }),
  ////////////////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    /*
    Watch list in Tab, 
    this is a local store key, it will store the filter/sorter
    to Local: 
    {
      "TabNameA": {
        filter: {..},
        sorter: {..}
      }
    }
    */
    "tabs": {
      type: String
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "addWatchText": {
      type: String,
      default: "i18n:add-watch"
    },
    "addWatchTip": {
      type: String,
      default: "i18n:add-watch-tip"
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    LocalKey() {
      if (_.isString(this.tabs) && this.tabs) {
        return this.tabs;
      }
    },
    //------------------------------------------------
    CurrentTab() {
      return _.get(this.myTabSet, "_current");
    },
    //------------------------------------------------
    hasCurrentTab() {
      return this.CurrentTab ? true : false;
    },
    //------------------------------------------------
    hasTabItems() {
      return !_.isEmpty(this.TabItems);
    },
    //------------------------------------------------
    TabItems() {
      let list = [];
      for (let text of _.keys(this.myTabSet)) {
        if ("_current" == text) {
          continue;
        }
        let index = list.length;
        let current = this.CurrentTab == text;
        list.push({
          index,
          text,
          current,
          className: current ? "is-current" : null
        });
      }
      return list;
    },
    //------------------------------------------------
    ActionItems() {
      return [
        {
          icon: "zmdi-filter-list",
          items: [
            {
              icon: "zmdi-alarm-plus",
              text: "i18n:add-watch-create",
              action: () => {
                this.OnCreateWatch();
              }
            },
            {
              icon: "far-edit",
              text: "i18n:rename",
              action: () => {
                this.OnRenameCurrentWatch();
              }
            },
            {
              icon: "fas-trash-alt",
              text: "i18n:add-watch-remove",
              action: () => {
                this.OnDeleteCurrentWatch();
              }
            },
            {},
            {
              icon: "fas-snowplow",
              text: "i18n:add-watch-clear",
              action: () => {
                this.OnClearAllWatch();
              }
            }
          ]
        }
      ];
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    async OnCreateWatch() {
      let key = await this.getNewWatchName();
      if (!key) {
        return;
      }
      if (this.myTabSet[key]) {
        return Ti.Alert("i18n:add-watch-exists", { type: "warn" });
      }
      let tabs = _.cloneDeep(this.myTabSet);
      tabs._current = key;
      tabs[key] = {
        filter: this.filter,
        sorter: this.sorter
      };
      this.saveToLocal(tabs);
    },
    //------------------------------------------------
    async OnRenameCurrentWatch() {
      let tabs = _.cloneDeep(this.myTabSet);
      let oldKey = tabs._current;
      if (!oldKey) {
        return;
      }
      let newKey = await this.getNewWatchName(oldKey);
      if (!newKey) {
        return;
      }
      if (this.myTabSet[newKey]) {
        return Ti.Alert("i18n:add-watch-exists", { type: "warn" });
      }
      delete tabs[oldKey];
      tabs[newKey] = {
        filter: this.filter,
        sorter: this.sorter
      };
      tabs._current = newKey;
      this.saveToLocal(tabs);
    },
    //------------------------------------------------
    async getNewWatchName(oldName) {
      let key = await Ti.Prompt("i18n:add-watch-create-tip", {
        value: oldName
      });
      key = _.trim(key);
      if (!key) {
        return;
      }
      return key;
    },
    //------------------------------------------------
    async OnSelectTab({ text }) {
      // Guard
      if (text == this.CurrentTab) {
        return;
      }
      let tabs = _.cloneDeep(this.myTabSet);
      tabs._current = text;
      this.saveToLocal(tabs);
      let data = tabs[text] || {};
      let { filter, sorter } = data;
      this.$notify("change", { filter, sorter });
    },
    //------------------------------------------------
    OnDeleteCurrentWatch() {
      // Guard
      if (!this.hasCurrentTab || !this.hasTabItems) {
        return;
      }

      // Get next Item
      let data;
      let tabs = _.cloneDeep(this.myTabSet);
      let nextTab = _.find(this.TabItems, (it) => {
        return it.text != this.CurrentTab;
      });
      if (nextTab) {
        data = tabs[nextTab.text];
        tabs._current = nextTab.text;
      } else {
        tabs._current = null;
      }

      delete tabs[this.CurrentTab];
      this.saveToLocal(tabs);

      if (data) {
        this.$notify("change", data);
      }
    },
    //------------------------------------------------
    OnClearAllWatch() {
      this.saveToLocal({});
    },
    //------------------------------------------------
    OnFilterChange({ filter, sorter }) {
      console.log("OnFilterChange", { filter, sorter });
      let tabs = _.cloneDeep(this.myTabSet);
      let key = tabs._current;
      if (key) {
        _.assign(tabs[key], {
          filter,
          sorter
        });
        this.saveToLocal(tabs);
      }
      return { stop: false };
    },
    //------------------------------------------------
    saveToLocal(data = {}) {
      // Guard
      if (!this.LocalKey) {
        return;
      }
      Ti.Storage.local.setObject(this.LocalKey, data);
      this.myTabSet = data;
    },
    //------------------------------------------------
    reloadFromLocal() {
      // Guard
      if (!this.LocalKey) {
        return;
      }
      let tabs = Ti.Storage.local.getObject(this.LocalKey);
      this.myTabSet = tabs;
    },
    //------------------------------------------------
    reload() {
      this.reloadFromLocal();
      this.tryInitSortable();
    },
    //------------------------------------------------
    switchItem(fromIndex, toIndex) {
      if (fromIndex != toIndex) {
        //console.log("switchItem", { fromIndex, toIndex });
        let keys = _.without(_.keys(this.myTabSet), "_current");
        Ti.Util.moveInArray(keys, fromIndex, toIndex);
        let tabs = { _current: this.CurrentTab };
        for (let key of keys) {
          tabs[key] = this.myTabSet[key];
        }
        this.saveToLocal(tabs);
      }
    },
    //------------------------------------------------
    initSortable() {
      this.$sortable = new Sortable(this.$refs.tabs, {
        animation: 300,
        //filter: ".as-nil-tip",
        onStart: () => {
          this.dragging = true;
        },
        onEnd: ({ oldIndex, newIndex }) => {
          this.switchItem(oldIndex, newIndex);
          _.delay(() => {
            this.dragging = false;
          }, 100);
        }
      });
    },
    //------------------------------------------------
    tryInitSortable() {
      if (_.isElement(this.$refs.tabs)) {
        if (!this.$sortable) {
          this.initSortable();
        }
      }
      // Destroy sortable: (com reused)
      else {
        if (this.$sortable) {
          this.$sortable.destroy();
          this.$sortable = undefined;
        }
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    //-----------------------------------------------
    "tabs": {
      handler: "reload",
      immediate: true
    }
    //-----------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted: function () {
    this.tryInitSortable();
  },
  ///////////////////////////////////////////////////
  beforeDestroy: function () {
    if (this.$sortable) {
      this.$sortable.destroy();
      this.$sortable = undefined;
    }
  }
  ////////////////////////////////////////////////////
};
export default _M;
