const _M = {
  ///////////////////////////////////////////
  provide : function() {
    return {
      "$gui" : this
    }
  },
  /////////////////////////////////////////
  data: ()=>({
    myShown : {},
    myViewportWidth  : 0,
    myViewportHeight : 0,
    myBlockMap : {}
  }),
  /////////////////////////////////////////
  props : {
    "defaultFlex" : {
      type : String,
      default : undefined,
      validator : (v)=>(_.isUndefined(v) || /^(nil|auto|grow|shrink|both|none)$/.test(v))
    },
    "defaultOverflow" : {
      type : String,
      default : undefined,
      validator : (v)=>(_.isUndefined(v) || /^(auto|none|fill|cover)$/.test(v))
    },
    "defaultComClass": {
      type: String,
      default: "ti-fill-parent"
    },
    "layout" : {
      type : Object,
      default : ()=>({
        desktop : {},
        tablet  : "desktop",
        phone   : "desktop"
      })
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "keepShownTo" : {
      type : String,
      default : undefined
    },
    "actionStatus" : {
      type : Object,
      default : ()=>({})
    },
    "shown" : {
      type : Object,
      default : ()=>({})
    },
    "canLoading" : {
      type : Boolean,
      default : false
    },
    // value should be prop of ti-loading
    "loadingAs" : {
      type : [Boolean, Object],
      default : undefined
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-loading" : this.isLoading
      })
    },
    //--------------------------------------
    TheLayout() {
      if(_.isEmpty(this.layout))
        return {}
      //....................................
      // Raw layout
      if(/^(rows|cols|tabs)$/.test(this.layout.type)) {
        return this.layout
      }
      //....................................
      // Auto adapt viewMode
      let lay = this.layout[this.viewportMode]
      // Refer onece
      if(_.isString(lay)) {
        lay = this.layout[lay]
      }
      // Refer twice (I think it is enough for most of cases)
      if(_.isString(lay)) {
        lay = this.layout[lay]
      }
      return lay || {}
    },
    //--------------------------------------
    isRowsLayout() {return "rows"==this.TheLayout.type},
    isColsLayout() {return "cols"==this.TheLayout.type},
    isTabsLayout() {return "tabs"==this.TheLayout.type},
    //--------------------------------------
    ThePanels() {
      let list = []

      // Join Global Panels
      this.joinThePanels(list, this.layout.panels, "G")

      // Join Current Mode Panels
      if(this.layout != this.TheLayout) {
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
      return this.canLoading 
             && this.loadingAs 
                  ? true 
                  : false
    },
    //--------------------------------------
    TheLoading() {
      if(_.isPlainObject(this.loadingAs)) {
        return this.loadingAs
      }
      return {}
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    isShown(...names) {
      for(let name of names) {
        if(this.TheShown[name])
          return true
      }
      return false
    },
    //--------------------------------------
    joinThePanels(list=[], panels=[], keyPrefix="") {
      if(_.isArray(panels) && panels.length > 0) {
        for(let i=0; i<panels.length; i++) {
          let pan = panels[i]
          let pos = Ti.Util.fallback(pan.position, "center")
          let index = list.length
          list.push({
            index,
            visible   : this.isShown(pan.name),
            key       : pan.name || `panel-${keyPrefix}-${index}`,
            transName : `ti-gui-panel-${pos}`,
            panel     : pan
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
      if(this.keepShownTo) {
        this.updateShown({[name]:true})
      }
      // Leave it to parent
      else {
        this.$notify("block:show", name)
      }
    },
    //--------------------------------------
    OnBlockHide(name) {
      // Update privated status
      if(this.keepShownTo) {
        this.updateShown({[name]:false})
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
      if(this.keepShownTo) {
        this.updateShown(shown)
      }
      // Leave it to parent
      else {
        this.$notify("block:shown", shown)
      }
    },
    //--------------------------------------
    syncMyShown(...showns) {
      if(this.keepShownTo) {
        this.myShown = _.assign({}, this.myShown, ...showns)
      }
    },
    //--------------------------------------
    persistMyStatus() {
      if(this.keepShownTo) {
        let shown = _.omitBy(this.myShown, (v)=>!v)
        Ti.Storage.session.setObject(this.keepShownTo, shown)
      }
    },
    //--------------------------------------
    loadMyStatus() {
      if(this.keepShownTo) {
        let shown = Ti.Storage.session.getObject(this.keepShownTo)
        this.syncMyShown(this.shown, shown)
      }
    },
    //--------------------------------------
    syncViewportMeasure() {
      let rect = Ti.Rects.createBy(this.$el);
      this.myViewportWidth  = rect.width
      this.myViewportHeight = rect.height
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
      if(this.myBlockMap[name]) {
        delete this.myBlockMap[name]
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "shown" : function(shown) {
      //console.log("ti-gui shown changed", shown)
      this.syncMyShown(shown)
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    //......................................
    Ti.Viewport.watch(this, {
      resize : _.debounce(()=>this.syncViewportMeasure(), 100)
    })
    //......................................
    this.syncViewportMeasure()
    //......................................
    this.loadMyStatus()
    //......................................
  },
  ///////////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  //////////////////////////////////////////
}
export default _M;