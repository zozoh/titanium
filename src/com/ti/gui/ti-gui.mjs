const _M = {
  ///////////////////////////////////////////
  provide: function () {
    return {
      "$gui": this
    }
  },
  /////////////////////////////////////////
  data: () => ({
    $inner: undefined,
    myShown: {},
    myViewportWidth: 0,
    myViewportHeight: 0,
    myBlockMap: {},
    myPanelVisibles: {}
  }),
  /////////////////////////////////////////
  props: {
    //-----------------------------------
    // Data
    //-----------------------------------
    "layout": {
      type: Object,
      default: () => ({
        desktop: {},
        tablet: "desktop",
        phone: "desktop"
      })
    },
    "schema": {
      type: Object,
      default: () => ({})
    },
    "activeElement": {
      type: [Element, Object]  /*null type is Object*/
    },
    "shown": {
      type: Object,
      default: () => ({})
    },
    "vars": {
      type: Object,
      default: () => ({})
    },
    //-----------------------------------
    // Behavior
    //-----------------------------------
    "defaultFlex": {
      type: String,
      default: undefined,
      validator: (v) => (_.isUndefined(v) || /^(nil|auto|grow|shrink|both|none)$/.test(v))
    },
    "defaultOverflow": {
      type: String,
      default: undefined,
      validator: (v) => (_.isUndefined(v) || /^(auto|none|fill|cover)$/.test(v))
    },
    "defaultComClass": {
      type: String,
      default: "ti-fill-parent"
    },
    "keepShownTo": {
      type: String,
      default: undefined
    },
    "actionStatus": {
      type: Object,
      default: () => ({})
    },
    "shownEmitName": {
      type: String,
      default: undefined
    },
    "shownNotifyName": {
      type: String,
      default: undefined
    },
    "canLoading": {
      type: Boolean,
      default: false
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    // value should be prop of ti-loading
    "loadingAs": {
      type: Object,
      default: undefined
    },
    "loading": {
      type: Boolean,
      default: false
    }
  },
  //////////////////////////////////////////
  computed: {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-loading": this.isLoading
      })
    },
    //--------------------------------------
    TheLayout() {
      let lay = {}
      if (_.isEmpty(this.layout))
        return lay
      //....................................
      // Raw layout
      if (/^(rows|cols|tabs)$/.test(this.layout.type)) {
        lay = this.layout
      }
      //....................................
      // Auto adapt viewMode
      else {
        lay = this.layout[this.viewportMode]
        // Refer onece
        if (_.isString(lay)) {
          lay = this.layout[lay]
        }
        // Refer twice (I think it is enough for most of cases)
        if (_.isString(lay)) {
          lay = this.layout[lay]
        }
      }
      //....................................
      // Filter block
      if (lay) {
        lay = _.cloneDeep(lay)
        lay.blocks = this.filterBlocks(lay.blocks, lay.type)
      }
      //....................................
      // Done
      return lay || {}
    },
    //--------------------------------------
    isRowsLayout() { return "rows" == this.TheLayout.type },
    isColsLayout() { return "cols" == this.TheLayout.type },
    isTabsLayout() { return "tabs" == this.TheLayout.type },
    //--------------------------------------
    BlockNames() {
      if (!this.layout) {
        return {}
      }
      return this.joinBlockNames({}, this.layout.blocks)
    },
    //--------------------------------------
    ThePanels() {
      let list = []

      // Join Global Panels
      this.joinThePanels(list, this.layout.panels, "G")

      // Join Current Mode Panels
      if (this.layout != this.TheLayout) {
        this.joinThePanels(list, this.TheLayout.panels, this.viewportMode)
      }

      // Done
      return list
    },
    //--------------------------------------
    TheShown() {
      return this.keepShownTo
        ? this.myShown
        : this.shown
    },
    //--------------------------------------
    isLoading() {
      return this.canLoading && this.loading
    },
    //--------------------------------------
    TheLoading() {
      return this.loadingAs || {}
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods: {
    //--------------------------------------
    OnMainTypeInit($innerCom) {
      this.$inner = $innerCom
    },
    //--------------------------------------
    OnPanelAfterEnter(pan) {
      this.myPanelVisibles = _.assign({}, {
        [pan.key]: pan.visible
      })
    },
    //--------------------------------------
    joinBlockNames(names = {}, blocks = []) {
      _.forEach(blocks, ({ name, blocks } = {}) => {
        if (name) {
          names[name] = true
        }
        if (_.isArray(blocks)) {
          this.joinBlockNames(names, blocks)
        }
      })
      return names;
    },
    //--------------------------------------
    isShown(...names) {
      for (let name of names) {
        if (this.TheShown[name])
          return true
      }
      return false
    },
    //--------------------------------------
    joinThePanels(list = [], panels = [], keyPrefix = "") {
      if (_.isArray(panels) && panels.length > 0) {
        for (let i = 0; i < panels.length; i++) {
          let pan = panels[i]
          if (!pan) {
            continue;
          }
          let pos = Ti.Util.fallback(pan.position, "center")
          let index = list.length
          list.push({
            index,
            visible: this.isShown(pan.name),
            key: pan.name || `panel-${keyPrefix}-${index}`,
            transName: `ti-gui-panel-${pos}`,
            panel: pan
          })
        }
      }
    },
    //--------------------------------------
    updateShown(shown) {
      this.syncMyShown(shown)
      this.persistMyStatus()
    },
    //--------------------------------------
    OnBlockShow(name) {
      // Update privated status
      if (this.keepShownTo) {
        this.updateShown({ [name]: true })
      }
      // Leave it to parent
      else {
        this.$notify("block:show", name)
      }
    },
    //--------------------------------------
    OnBlockHide(name) {
      // Update privated status
      if (this.keepShownTo) {
        this.updateShown({ [name]: false })
      }
      // Leave it to parent
      else {
        this.$notify("block:hide", name)
      }
    },
    //--------------------------------------
    OnBlockShownUpdate(shown) {
      //console.log(shown)
      // Update privated status
      if (this.keepShownTo) {
        this.updateShown(shown)
      }
      // Leave it to parent
      else {
        this.$notify("block:shown", shown)
      }
    },
    //--------------------------------------
    filterShown(shown = {}) {
      return _.omitBy(shown, (v, k) => {
        if (!v)
          return true
        if (!this.BlockNames[k])
          return true
        return false
      })
    },
    //--------------------------------------
    syncMyShown(...showns) {
      if (this.keepShownTo) {
        let shown = _.assign({}, this.myShown, ...showns)
        this.myShown = shown
        if (this.shownEmitName) {
          this.$emit(this.shownEmitName, this.myShown)
        }

        if (this.shownNotifyName) {
          this.$notify(this.shownNotifyName, this.myShown)
        }
      }
    },
    //--------------------------------------
    persistMyStatus() {
      if (this.keepShownTo) {
        let shown = this.filterShown(this.myShown)
        Ti.Storage.session.setObject(this.keepShownTo, shown)
      }
    },
    //--------------------------------------
    loadMyStatus() {
      if (this.keepShownTo) {
        let shown = Ti.Storage.session.getObject(this.keepShownTo)
        this.syncMyShown(this.shown, shown)
      }
    },
    //--------------------------------------
    syncViewportMeasure() {
      let rect = Ti.Rects.createBy(this.$el);
      //console.log(rect.toString())
      this.myViewportWidth = rect.width
      this.myViewportHeight = rect.height
    },
    //--------------------------------------
    filterBlocks(blocks, type) {
      let reBlocks = []
      //let shown = JSON.stringify(this.TheShown)
      _.forEach(blocks, bl => {
        //console.log(bl.name, shown)
        let isShow = true
        if ("tabs" != type && bl.name) {
          isShow = _.get(this.TheShown, bl.name)
          isShow = Ti.Util.fallback(isShow, true)
        }
        if (isShow) {
          reBlocks.push(bl)
          if (bl.blocks) {
            bl.blocks = this.filterBlocks(bl.blocks, bl.type)
          }
        }
      })
      return reBlocks
    },
    //--------------------------------------
    $block(name) {
      return this.myBlockMap[name]
    },
    //--------------------------------------
    registerBlock(name, $block) {
      //console.log("registerBlock", name, $block.tiComId)
      this.myBlockMap[name] = $block
    },
    //--------------------------------------
    unregisterBlock(name) {
      if (this.myBlockMap[name]) {
        delete this.myBlockMap[name]
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "shown": {
      handler: function (shown, old) {
        if (old && !_.isEqual(shown, old)) {
          //console.log(`ti-gui: ${this.$parent.tiComId} shown changed`, shown)
          this.syncMyShown(shown)
          this.$nextTick(() => {
            this.syncViewportMeasure();
          })
        }
      },
      immediate: true
    },
    "loadingAs": "syncViewportMeasure",
    "loading": "syncViewportMeasure",
    "layout": "syncViewportMeasure"
  },
  //////////////////////////////////////////
  mounted: function () {
    //......................................
    Ti.Viewport.watch(this, {
      resize: _.debounce(() => this.syncViewportMeasure(), 100)
    })
    //......................................
    this.loadMyStatus()
    //......................................
    _.delay(() => {
      this.syncViewportMeasure()
    })
    //......................................
  },
  ///////////////////////////////////////////////////
  beforeDestroy: function () {
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////
}
export default _M;