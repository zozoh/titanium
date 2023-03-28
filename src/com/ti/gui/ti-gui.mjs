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
    myLayout: {},
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
    "hideWhenLoading": {
      type: Boolean,
      default: false
    },
    "maskWhenLoading": {
      type: Boolean,
      default: true
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
      type: [Boolean, String],
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
    LayoutType(){
      return _.get(this.myLayout, "type")
    },
    //--------------------------------------
    isShowMainArea() {
      if (this.isLoading && this.hideWhenLoading) {
        return false
      }
      return true
    },
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
      if (this.layout != this.myLayout) {
        this.joinThePanels(list, this.myLayout.panels, this.viewportMode)
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
      return this.canLoading && this.loading ? true : false
    },
    //--------------------------------------
    TheLoading() {
      let as = this.loadingAs || {}
      if (_.isString(this.loading)) {
        if (as[this.loading]) {
          return as[this.loading]
        }
      }
      let keys = Ti.Util.truthyKeys(this.actionStatus)
      for (let key of keys) {
        let val = this.actionStatus[key]
        if (_.isObject(val)) {
          return val
        }
        if (as[key]) {
          return as[key]
        }
      }
      if (as.reloading) {
        return as.reloading
      }
      return as
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
    evalLayout() {
      //console.log("evalLayout")
      let lay = {}
      if (_.isEmpty(this.layout))
        return lay
      //....................................
      // Raw layout
      if (/^(rows|cols|tabs|grid)$/.test(this.layout.type)) {
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
        Ti.Storage.local.setObject(this.keepShownTo, shown)
      }
    },
    //--------------------------------------
    loadMyStatus() {
      if (this.keepShownTo) {
        let shown = Ti.Storage.local.getObject(this.keepShownTo)
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
    },
    //--------------------------------------
    tryUpdateLayout(newVal, oldVal) {
      if (!_.isEqual(newVal, oldVal)) {
        this.myLayout = this.evalLayout();
        this.$nextTick(() => {
          this.syncViewportMeasure()
        })
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
    "layout": {
      handler : "tryUpdateLayout",
      immediate:true
    }
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