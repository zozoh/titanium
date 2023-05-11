const TI_TREE = {
  //////////////////////////////////////////
  data: () => ({
    "myTreeTableData": [],
    "myOpenedNodePaths": {},
    "myCurrentId": null
  }),
  //////////////////////////////////////////
  props: {
    "nodeClassName": {
      type: String,
      default: undefined
    },
    // The list to be rendered
    "data": {
      type: [Object, Array],
      default: undefined
    },
    "testLoading": {
      type: [Object, Function],
      default: undefined
    },
    // If date is array
    // it can auto group to tree like structure
    // but I need the obj parent Id
    "autoGroupBy": {
      type: String,
      default: undefined
    },
    // the key of obj to match children parentId(autoGroupBy)
    "autoGroupIdKey": {
      type: String,
      default: "id"
    },
    "autoGroupTo": {
      type: String,
      default: "children"
    },
    "otherGroup": {
      type: Object,
      default: undefined
    },
    "idBy": {
      type: [String, Function],
      default: () => it => Ti.Util.getFallbackEmpty(it, "id", "value")
      // default: function(it){
      //   return Ti.Util.getFallbackEmpty(it, "id", "value")
      // } 
    },
    "nameBy": {
      type: [String, Function],
      default: () => it => Ti.Util.getFallbackEmpty(it, "name", "nm", "id")
    },
    "childrenBy": {
      type: [String, Function],
      default: "children"
    },
    "leafBy": {
      type: [String, Object, Function, Array],
      default: () => ({
        "children": ""
      })
    },
    "loadingNode": {
      type: Object,
      default: () => ({
        name: "i18n:loading"
      })
    },
    "emptyNode": {
      type: Object,
      default: () => ({
        icon: "fas-braille",
        name: "i18n:empty"
      })
    },
    "title": {
      type: String,
      default: 'i18n:title'
    },
    "mainWidth": {
      type: [String, Number],
      default: 'stretch'
    },
    "display": {
      type: [String, Object, Array],
      default: "name"
    },
    "rowClassBy": {
      type: [Function, String]
    },
    // Default to open the node in depth.
    // the top node depth is 1, which is eqausl the path array length.
    // If 0, it will close all top leavel nodes
    "defaultOpenDepth": {
      type: Number,
      default: 0
    },
    // Local store to save the tree open status
    "keepOpenBy": {
      type: String,
      default: null
    },
    "keepCurrentBy": {
      type: String,
      default: null
    },
    "changedId": {
      type: String,
      default: null
    },
    "currentId": {
      type: String,
      default: null
    },
    "checkedIds": {
      type: [Array, Object],
      default: () => []
    },
    "openedNodePaths": {
      type: Object,
      default: () => ({})
    },
    "multi": {
      type: Boolean,
      default: false
    },
    "nodeCheckable": {
      type: [Object, Function],
      default: undefined
    },
    "nodeSelectable": {
      type: [Object, Function],
      default: undefined
    },
    "nodeOpenable": {
      type: [Object, Function],
      default: undefined
    },
    "nodeCancelable": {
      type: [Object, Function],
      default: undefined
    },
    "nodeHoverable": {
      type: [Object, Function],
      default: undefined
    },
    "checkable": {
      type: Boolean,
      default: false
    },
    // select item
    "selectable": {
      type: Boolean,
      default: true
    },
    "cancelable": {
      type: Boolean,
      default: true
    },
    "openable": {
      type: Boolean,
      default: true
    },
    "hoverable": {
      type: Boolean,
      default: false
    },
    "onNodeSelect": {
      type: Function,
      default: undefined
    },
    "width": {
      type: [String, Number],
      default: null
    },
    "puppetMode": {
      type: Boolean,
      default: false
    },
    "height": {
      type: [String, Number],
      default: null
    },
    "spacing": {
      type: String,
      default: "comfy",
      validator: v => /^(comfy|tiny)$/.test(v)
    },
    "autoScrollIntoView": {
      type: Boolean,
      default: true
    },
    "columnResizable": {
      type: Boolean,
      default: false
    },
    "keepCustomizedTo": {
      type: String,
      default: undefined
    },
    "autoOpen": {
      type: Boolean,
      default: false
    },
    "showRoot": {
      type: Boolean,
      default: true
    },
    "nodeHandleIcons": {
      type: Array,
      default: () => [
        "zmdi-chevron-right",
        "zmdi-chevron-down"]
    },
    "border": {
      type: String,
      default: "column",
      validator: v => /^(row|column|cell|none)$/.test(v)
    },
    "rowNumberBase": {
      type: Number,
      default: undefined
    },
    // "extendFunctionSet" : {
    //   type : Object,
    //   default : ()=>({})
    // },
    "fields": {
      type: Array,
      default: () => []
    },
    "blankAs": undefined
  },
  //////////////////////////////////////////
  watch: {

  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-selectable": this.selectable,
        "is-hoverable": this.hoverable
      }, `as-spacing-${this.spacing}`)
    },
    //--------------------------------------
    getNodeId() {
      if (_.isFunction(this.idBy)) {
        return (it) => this.idBy(it)
      }
      return (it) => _.get(it, this.idBy)
    },
    //--------------------------------------
    getNodeName() {
      if (_.isFunction(this.nameBy)) {
        return it => this.nameBy(it)
      }
      return it => _.get(it, this.nameBy)
    },
    //--------------------------------------
    isNodeLeaf() {
      if (_.isFunction(this.leafBy)) {
        return it => (this.leafBy(it) ? true : false)
      }
      // Auto Match
      let mat = Ti.AutoMatch.parse(this.leafBy)
      return it => mat(it)
    },
    //--------------------------------------
    isNodeLoading() {
      if (!this.testLoading) {
        return () => false
      }
      if (_.isFunction(this.testLoading)) {
        return this.testLoading
      }
      return Ti.AutoMatch.parse(this.testLoading)
    },
    //--------------------------------------
    isNodeCheckable() {
      return this.evalBehaviorsMatcher(this.nodeCheckable, this.checkable)
    },
    //--------------------------------------
    isNodeSelectable() {
      return this.evalBehaviorsMatcher(this.nodeSelectable, this.selectable)
    },
    //--------------------------------------
    isNodeCancelable() {
      return this.evalBehaviorsMatcher(this.nodeCancelable, this.cancelable)
    },
    //--------------------------------------
    isNodeOpenable() {
      return this.evalBehaviorsMatcher(this.nodeOpenable, this.openable)
    },
    //--------------------------------------
    isNodeHoverable() {
      return this.evalBehaviorsMatcher(this.nodeHoverable, this.hoverable)
    },
    //--------------------------------------
    getNodeChildren() {
      if (_.isFunction(this.childrenBy)) {
        return it => this.childrenBy(it)
      }
      return it => _.get(it, this.childrenBy)
    },
    //--------------------------------------
    isTable() {
      return _.isArray(this.fields) && !_.isEmpty(this.fields)
    },
    //--------------------------------------
    TableHead() {
      if (this.isTable) {
        return "frozen"
      }
      return "none"
    },
    //--------------------------------------
    TableFields() {
      let mainCol = {
        title: this.title,
        width: this.mainWidth,
        nowrap: true,
        display: this.display
      }
      if (this.isTable) {
        return _.concat(mainCol, this.fields)
      }
      return [mainCol]
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnTableInit($table) {
      this.$table = $table
    },
    //--------------------------------------
    evalBehaviorsMatcher(cust, dft) {
      let fn;
      if (cust) {
        fn = Ti.AutoMatch.parse(cust)
      }
      return (row) => {
        if (row.fake)
          return false

        let re;
        if (fn)
          re = fn(row)

        return Ti.Util.fallback(re, dft)
      }
    },
    //--------------------------------------
    async evalTreeTableData() {
      // if(_.get(this.data, "value.title"))
      //     console.log("evalTreeTableData", _.get(this.data, "value.title"))
      let tableData = []

      //if(this.showRoot)
      //console.log("evalTreeTableData", this.data)

      // Array push to root
      if (_.isArray(this.data)) {
        let list = this.data
        // Pre group data
        if (this.autoGroupBy) {
          list = this.groupTreeData(list)
        }

        await this.joinTreeTableRow(tableData, {}, null, list)
      }
      // already has root
      else if (this.data) {
        await this.joinTreeTableRow(tableData, this.data, null)
      }

      this.myTreeTableData = tableData
    },
    //--------------------------------------
    async joinTreeTableRow(rows = [], item = {}, path = [], children) {
      // if(this.showRoot)
      //console.log("joinTreeTableRow", item)
      let self = {}
      //....................................
      // For ROOT
      if (!path) {
        self.name = this.getNodeName(item) || "$ROOT$"
        self.path = []
        self.pathId = "/"
        self.id = Ti.Util.fallbackNil(this.getNodeId(item), self.pathId)
        self.indent = 0
        self.leaf = false
        // self.opened = !this.showRoot
        //   ? true 
        //   : Ti.Util.fallback(
        //       this.myOpenedNodePaths[self.pathId], 
        //       self.indent < this.defaultOpenDepth);
        self.opened = !this.showRoot || this.myOpenedNodePaths[self.pathId]
        self.defaultOpen = self.indent < this.defaultOpenDepth
        self.shouldTryOpen = Ti.Util.fallback(self.opened, self.defaultOpen)
      }
      // Others node
      else {
        self.name = this.getNodeName(item)
        self.path = _.concat(path, self.name)
        self.pathId = self.path.join("/")
        self.id = Ti.Util.fallbackNil(this.getNodeId(item), self.pathId)
        self.indent = self.path.length
        self.leaf = this.isNodeLeaf(item)
        // self.opened = Ti.Util.fallback(
        //   this.myOpenedNodePaths[self.pathId], 
        //   self.indent < this.defaultOpenDepth);
        self.opened = this.myOpenedNodePaths[self.pathId]
        self.defaultOpen = self.indent < this.defaultOpenDepth
        self.shouldTryOpen = Ti.Util.fallback(self.opened, self.defaultOpen)
      }
      //....................................
      // Join the rawData
      self.rawData = item
      //....................................
      // Add root if necesssary
      if (this.showRoot) {
        rows.push(self)
      }
      // If not show root, minus depth
      else {
        self.indent--
        if (self.indent >= 0) {
          rows.push(self)
        }
      }
      //....................................
      // Join Children
      if (self.shouldTryOpen && !self.leaf) {
        if (!children) {
          children = await this.getNodeChildren(item)
        }
        // Empty or loading node
        if (!_.isArray(children) || _.isEmpty(children)) {
          // Loading node
          if (this.isNodeLoading(self)) {
            rows.push(this.genFakeLoadingNode(self.indent))
          }
          // Empty node
          else if (self.opened) {
            rows.push(this.genFakeEmptyNode(self.indent))
          }
        }
        // Load children
        else {
          self.opened = true   // Make sure the node is opend
          for (let child of children) {
            await this.joinTreeTableRow(rows, child, self.path)
          }
        }
      }
      // After join children, we can finnaly decide the tree state icon (handle)
      self.icon = self.leaf ? true : this.nodeHandleIcons[self.opened ? 1 : 0]
      //....................................
    },
    //--------------------------------------
    genFakeLoadingNode(indent = 0) {
      return {
        indent: indent + 2,
        leaf: true,
        fake: true,
        icon: "fas-spinner fa-spin",
        rawData: this.loadingNode
      }
    },
    //--------------------------------------
    genFakeEmptyNode(indent = 0) {
      return {
        indent: indent + 3,
        leaf: true,
        fake: true,
        rawData: this.emptyNode
      }
    },
    //--------------------------------------
    groupTreeData(data = [], groupBy = this.autoGroupBy) {
      if (!groupBy)
        return
      // Clone data
      data = _.cloneDeep(data)

      // Other data
      let others = []

      // Build map
      let map = {}
      _.forEach(data, it => {
        let key = it[this.autoGroupIdKey]
        if (!Ti.Util.isNil(key))
          map[key] = it
      })

      // Group to parent
      // Find the top list (nil value for autoGroupBy)
      let tops = []
      _.forEach(data, it => {
        let pKey = it[this.autoGroupBy]
        // Group to parent
        if (!Ti.Util.isNil(pKey)) {
          let pIt = map[pKey]
          if (pIt) {
            Ti.Util.pushValue(pIt, this.autoGroupTo, it);
          }
          // Join to others
          else {
            others.push(it)
          }
        }
        // Join to tops
        else {
          tops.push(it)
        }
      })

      // Auto show others
      if (this.otherGroup && !_.isEmpty(others)) {
        let topOther = _.cloneDeep(this.otherGroup)
        _.set(topOther, this.autoGroupTo, others)
        tops.push(topOther)
      }

      // done
      if (!_.isEmpty(tops))
        return tops

      return data
    },
    //--------------------------------------
    findTableRow(rowId) {
      if (!Ti.Util.isNil(rowId)) {
        for (let row of this.myTreeTableData) {
          if (row.id == rowId) {
            return row
          }
        }
      }
    },
    //--------------------------------------
    OnCellItemChange({ name, value, rowId } = {}) {
      console.log("OnCellItemChange", {name, value, rowId})
      let row = this.findTableRow(rowId)
      if (row) {
        this.$notify("node:item:change", {
          name,
          value,
          node: row,
          nodeId: rowId,
          data: row.rawData
        })
      }
    },
    //--------------------------------------
    OnRowSelect(payload = {}) {
      let current, node, selected = []
      let {
        currentId,
        checkedIds = {}
      } = payload

      // Has selected
      if (currentId) {
        let currentRow;
        for (let row of this.myTreeTableData) {
          if (row.id == currentId) {
            currentRow = row
            current = row.rawData
          }
          if (checkedIds[row.id]) {
            selected.push(row.rawData)
          }
        }
        // Auto Open
        if (currentRow && this.autoOpen) {
          this.openRow(currentRow)
        }
        // Store current Id
        this.myCurrentId = _.get(currentRow, "id")
        node = currentRow
      }
      // Cancel current row
      else {
        this.myCurrentId = null
      }
      // Save local status
      if (this.keepCurrentBy) {
        if (!this.puppetMode) {
          Ti.Storage.session.set(this.keepCurrentBy, this.myCurrentId)
        }
      }

      // Prepare context
      let evtCtxt = _.assign({}, payload, {
        node,
        current, selected,
        currentId, checkedIds
      })

      // Callback
      if (_.isFunction(this.onNodeSelect)) {
        this.onNodeSelect.apply(this, [evtCtxt])
      }

      // Emit the value
      this.$notify("select", evtCtxt)
    },
    //--------------------------------------
    OnRowIconClick({ rowId } = {}) {
      let row = this.findTableRow(rowId)
      // Open it
      if (row && !row.leaf && !row.opened) {
        this.openRow(row)
      }
      // Close it
      else {
        this.closeRow(row)
      }
    },
    //--------------------------------------
    OnRowOpen(payload = {}) {
      let { id } = payload
      let row = this.findTableRow(id)
      if (row && !row.leaf && !row.opened) {
        this.openRow(row)
      }
      return { stop: false }
    },
    //--------------------------------------
    openRow(rowOrId) {
      let row = _.isString(rowOrId)
        ? this.findTableRow(rowOrId)
        : rowOrId
      if (row && !row.leaf && !row.opened) {
        this.$set(this.myOpenedNodePaths, row.pathId, true)
        // Notify status changed
        this.$notify("opened", row)
        // Save to Local
        this.saveNodeOpenStatus()
      }
    },
    //--------------------------------------
    selectNodeById(rowId) {
      this.$table.selectRow(rowId)
    },
    //--------------------------------------
    selectPrevRow(options) {
      this.$table.selectPrevRow(options)
    },
    //--------------------------------------
    selectNextRow(options) {
      console.log("ti-tree.selectNextRow", options)
      this.$table.selectNextRow(options)
    },
    //--------------------------------------
    isOpened(rowOrId) {
      let row = _.isString(rowOrId)
        ? this.findTableRow(rowOrId)
        : rowOrId
      return row ? row.opened : false
    },
    //--------------------------------------
    closeRow(rowOrId) {
      let row = _.isString(rowOrId)
        ? this.findTableRow(rowOrId)
        : rowOrId
      if (row && !row.leaf && row.opened) {
        this.$set(this.myOpenedNodePaths, row.pathId, false)
        // Notify status changed
        this.$notify("closed", row)
        // Save to Local
        this.saveNodeOpenStatus()
      }
    },
    //--------------------------------------
    saveNodeOpenStatus() {
      if (this.keepOpenBy) {
        Ti.Storage.session.setObject(this.keepOpenBy, this.myOpenedNodePaths)
      }
      this.$notify("opened-status:changed", this.myOpenedNodePaths)
    },
    //--------------------------------------
    syncOpenedNodePaths() {
      this.myOpenedNodePaths = _.assign({}, this.openedNodePaths)
    },
    //--------------------------------------
    __ti_shortcut(uniqKey) {
      console.log(uniqKey)
      if ("ARROWLEFT" == uniqKey) {
        this.closeRow(this.myCurrentId)
      }

      if ("ARROWRIGHT" == uniqKey) {
        this.openRow(this.myCurrentId)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "data": async function (newVal, oldVal) {
      //console.log("change data")
      if (!_.isEqual(newVal, oldVal)) {
        await this.evalTreeTableData()
      }
    },
    "openedNodePaths": function (newVal, oldVal) {
      if (!_.isEqual(newVal, oldVal)) {
        //console.log("tree openedNodePaths changed")
        this.syncOpenedNodePaths()
      }
    }
  },
  //////////////////////////////////////////
  mounted: async function () {
    //.................................
    this.syncOpenedNodePaths()
    //.................................
    // Ti.Dom.watchDocument("mouseup", this.__on_mouseup)
    // Recover the open status from local store
    if (this.keepOpenBy) {
      this.myOpenedNodePaths = Ti.Storage.session.getObject(this.keepOpenBy)
      if (!this.puppetMode) {
        this.$notify("opened-status:changed", this.myOpenedNodePaths)
      }
    }
    //................................
    // Eval Data
    await this.evalTreeTableData()
    //................................
    // Watch Deep
    this.$watch("myOpenedNodePaths", () => {
      this.evalTreeTableData()
    }, { deep: true })
    //................................
    // Recover the current
    if (this.keepCurrentBy) {
      let currentId = Ti.Storage.session.get(this.keepCurrentBy)
      if (!Ti.Util.isNil(currentId)) {
        this.$nextTick(() => {
          this.$children[0].selectRow(currentId)
        })
      }
    }
    //................................
  },
  //////////////////////////////////////////
  beforeDestroy: function () {
    //Ti.Dom.unwatchDocument("mouseup", this.__on_mouseup)
  }
  //////////////////////////////////////////
}
export default TI_TREE