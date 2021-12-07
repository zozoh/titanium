export default {
  ////////////////////////////////////////////////////
  data: () => ({
    myList: [],
    myPager: {},
    /*{filter: {}, sorter: {ct: -1}}*/
    mySearch: {},
    myCurrentId: undefined
  }),
  ////////////////////////////////////////////////////
  props: {
    //------------------------------------------------
    // Data
    //------------------------------------------------
    "meta": {
      type: Object
    },
    "data": {
      type: Object
    },
    "search": {
      type: Object
    },
    "status": {
      type: Object,
      default: () => ({})
    },
    "currentId": {
      type: String,
    },
    //------------------------------------------------
    // Behavior
    //------------------------------------------------
    "autoSelect": {
      type: Boolean,
      default: false
    },
    "multi": {
      type: Boolean
    },
    "reloadBy": {
      type: [String, Function],
      default: "main/query"
    },
    "viewType": String,
    "exposeHidden": Boolean,
    // TODO ... need to apply those settins below
    // in __on_events
    // "notifyName" : {
    //   type : String,
    //   default : "change"
    // },
    // "notifyWhen" : {
    //   type : String,
    //   default : "select"
    // },
    // "notifyPayload" : {
    //   type : [Object, Function]
    // },
    "events": Object,
    "canLoading": Boolean,
    //..........................
    // Table about prop
    //..........................
    "autoScrollIntoView": {
      type: Boolean,
      default: true
    },
    "columnResizable": {
      type: Boolean,
      default: false
    },
    "canCustomizedFields": {
      type: Boolean,
      default: false
    },
    "headDisplay": {
      type: [String, Object, Array],
      default: undefined
    },
    "keepCustomizedTo": {
      type: String,
      default: undefined
    },
    //------------------------------------------------
    // Aspect
    //------------------------------------------------
    "loading": Boolean,
    "loadingAs": Object,
    "tableFields": undefined,
    "listDisplay": undefined,
    "filter": {
      type: Object,
      default: () => ({
        comType: "WnThingFilter",
        comConf: {
          "placeholder": "i18n:filter",
          "status": "=status",
          "value": "=mySearch",
          "sorter": {
            "options": [
              { "value": "nm", "text": "i18n:wn-key-nm" },
              { "value": "ct", "text": "i18n:wn-key-ct" }
            ]
          }
        }
      })
    },
    "list": {
      type: Object,
      default: () => ({
        comType: "WnAdaptlist",
        comConf: {
          "rowNumberBase": "=rowNumberBase",
          "meta": "=meta",
          "currentId": "=currentId",
          "data": {
            list: "=myList",
            pager: "=myPager"
          },
          "multi": "=multi",
          "status": "=status"
        }
      })
    },
    "rowNumberBase": {
      type: Number,
      default: undefined
    },
    "itemClassName": {
      type: String
    },
    "itemBadges": {
      type: [Object, Function]
    },
    "moveToConf": {
      type: Object
    },
    "pager": {
      type: Object,
      default: () => ({
        comType: "TiPagingJumper",
        comConf: {
          "value": "=myPager",
          "valueType": "longName"
        }
      })
    },
    "nav": {
      type: Object
    },
    "detail": {
      type: Object,
      default: () => ({
        comType: "TiLabel",
        comConf: {
          "value": "I am detail"
        }
      })
    },
    "navBlock": {
      type: Object,
      default: () => ({})
    },
    "mainBlock": {
      type: Object,
      default: () => ({})
    },
    "detailBlock": {
      type: Object,
      default: () => ({})
    }
  },
  ////////////////////////////////////////////////////
  computed: {
    //------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //------------------------------------------------
    ComNav() { return Ti.Util.explainObj(this, this.nav) },
    ComFilter() { return Ti.Util.explainObj(this, this.filter) },
    ComList() {
      let com = Ti.Util.explainObj(this, this.list)
      _.merge(com, {
        comConf: {
          onInit: this.OnListInit,
          itemClassName: this.itemClassName,
          itemBadges: this.itemBadges,
          viewType: this.viewType,
          exposeHidden: this.exposeHidden,
          tableFields: this.tableFields,
          listDisplay: this.listDisplay,
          moveToConf: this.moveToConf,
          // Table prop
          tableViewConf: {
            autoScrollIntoView: this.autoScrollIntoView,
            columnResizable: this.columnResizable,
            canCustomizedFields: this.canCustomizedFields,
            headDisplay: this.headDisplay,
            keepCustomizedTo: this.keepCustomizedTo
          }
        }
      })
      return com
    },
    ComPager() { return Ti.Util.explainObj(this, this.pager) },
    ComDetail() { return Ti.Util.explainObj(this, this.detail) },
    //------------------------------------------------
    TheLayout() {
      let columns = []
      //
      // Nav Block
      //
      if (this.ComNav) {
        columns.push(_.assign(
          {
            size: "16%",
            border: true,
          },
          this.navBlock,
          {
            name: "nav",
            body: "nav"
          }
        ))
      }
      //
      // Main Block
      //
      let main = []
      if (this.ComFilter) {
        main.push({
          name: "filter",
          size: 43,
          body: "filter"
        })
      }
      main.push({
        name: "list",
        size: "stretch",
        overflow: "cover",
        body: "list"
      })
      if (this.ComPager) {
        main.push({
          name: "pager",
          size: "auto",
          body: "pager"
        })
      }
      // Join to columns
      columns.push(_.assign(
        {
          size: "61.8%",
          border: true,
        },
        this.mainBlock,
        {
          type: "rows",
          blocks: main
        }
      ))
      //
      // Detail Block
      //
      if (this.ComDetail) {
        columns.push(_.assign({},
          this.detailBlock,
          {
            name: "detail",
            body: "detail"
          }
        ))
      }
      // Multi columns
      if (columns.length > 1) {
        return {
          type: "cols",
          border: true,
          blocks: columns
        }
      }
      // Single column, (main only)
      return columns[0]
    },
    //------------------------------------------------
    TheSchema() {
      return {
        nav: this.ComNav,
        filter: this.ComFilter,
        list: this.ComList,
        pager: this.ComPager,
        detail: this.ComDetail
      }
    },
    //------------------------------------------------
    CurrentObj() {
      if (this.myCurrentId && _.isArray(this.myList)) {
        for (let li of this.myList) {
          if (li.id == this.myCurrentId) {
            return li
          }
        }
      }
    },
    //------------------------------------------------
    EventRouting() {
      return _.assign({}, this.events)
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods: {
    //------------------------------------------------
    OnListInit($adaptlist) {
      this.$adaptlist = $adaptlist
    },
    //------------------------------------------------
    OnFilterChange(filter) {
      this.reload({ filter, pager: { pageNumber: 1 } })
    },
    //------------------------------------------------
    OnSorterChange(sorter) {
      this.reload({ sorter, pager: { pageNumber: 1 } })
    },
    //------------------------------------------------
    OnPagerChange(pager) {
      this.reload({ pager })
    },
    //------------------------------------------------
    OnListViewTypeChange() {
      return { name: "listviewtype:change", stop: false }
    },
    //------------------------------------------------
    OnSelectItem({ currentId }) {
      this.myCurrentId = currentId
      return { stop: false }
    },
    //------------------------------------------------
    doAutoSelectItem() {
      // Guard
      if (!this.autoSelect)
        return
      // Try the last current Id
      if (this.myCurrentId) {
        let row = this.$adaptlist.findRowById(this.myCurrentId)
        if (row) {
          this.selectItem(row.id)
          return
        }
      }
      // Default use the first item
      this.selectItemByIndex(0)
    },
    //------------------------------------------------
    async reload({ filter, sorter, pager } = {}) {
      if (_.isString(this.reloadBy)) {
        return await Ti.App(this).dispatch(this.reloadBy, {
          filter, sorter, pager
        })
      }
      // Customized reloading
      return await this.reloadBy({ filter, sorter, pager })
    },
    //------------------------------------------------
    // Delegate methods
    setItem(newItem) {
      this.$adaptlist.setItem(newItem)
    },
    selectItem(id) {
      this.$adaptlist.selectItem(id)
    },
    selectItemByIndex(id) {
      this.$adaptlist.selectItemByIndex(id)
    },
    checkItem(id) {
      this.$adaptlist.checkItem(id)
    },
    toggleItem(id) {
      this.$adaptlist.toggleItem(id)
    },
    invokeList(methodName) {
      this.$adaptlist.invokeList(methodName)
    },
    getCurrentItem() {
      return this.$adaptlist.getCurrentItem()
    },
    getCheckedItems() {
      return this.$adaptlist.getCheckedItems()
    },
    openLocalFileSelectdDialog() {
      return this.$adaptlist.openLocalFileSelectdDialog()
    },
    async openCurrentMeta() {
      return this.$adaptlist.openCurrentMeta()
    },
    async openCurrentPrivilege() {
      return this.$adaptlist.openCurrentPrivilege()
    },
    async doCreate() {
      return this.$adaptlist.doCreate()
    },
    async doRename() {
      return this.$adaptlist.doRename()
    },
    async doBatchUpdate() {
      return this.$adaptlist.doBatchUpdate()
    },
    async doMoveTo() {
      return this.$adaptlist.doMoveTo()
    },
    async doDelete(confirm) {
      return this.$adaptlist.doDelete(confirm)
    },
    //--------------------------------------
    //
    // Callback & Events
    //
    //--------------------------------------
    // For Event Bubble Dispatching
    __on_events(name, ...args) {
      //console.log("__on_events", name, args)
      // Try to get handler
      let fn = _.get(this.EventRouting, name)
      if (!fn) {
        fn = this.$tiEventTryFallback(name, this.EventRouting)
      }

      // Gen invoking
      return Ti.Shortcut.genEventActionInvoking(fn, {
        app: Ti.App(this),
        context: _.assign({
          $args: args
        }, this.CurrentObj),
        funcSet: this
      })
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  watch: {
    //------------------------------------------------
    "data": {
      handler: function (newVal, oldVal) {
        if (_.isUndefined(oldVal) || !_.isEqual(newVal, oldVal)) {
          this.myList = _.get(this.data, "list")
          this.myPager = _.get(this.data, "pager")
          this.$nextTick(() => {
            _.delay(() => {
              this.doAutoSelectItem()
            }, 100)
          })
        }
      },
      immediate: true
    },
    "search": {
      handler: function () {
        this.mySearch = _.cloneDeep(this.search)
      },
      immediate: true
    },
    "currentId": {
      handler: function (newVal, oldVal) {
        if (!_.isEqual(newVal, oldVal)) {
          this.myCurrentId = newVal
        }
      },
      immediate: true
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  mounted: function () {
    this.$nextTick(() => {
      _.delay(() => {
        this.doAutoSelectItem()
      }, 100)
    })
  }
  ////////////////////////////////////////////////////
}