export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  data: ()=>({
    myShown : {},
    myViewportWidth  : 0,
    myViewportHeight : 0,
  }),
  /////////////////////////////////////////
  props : {
    "className" : null,
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
      default : null
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
      default : null
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    topClass() {
      return Ti.Css.mergeClassName({
        "is-loading" : this.isLoading
      }, this.className)
    },
    //--------------------------------------
    theLayout() {
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
    isRowsLayout() {
      return "rows" == this.theLayout.type
    },
    //--------------------------------------
    isColsLayout() {
      return "cols" == this.theLayout.type
    },
    //--------------------------------------
    isTabsLayout() {
      return "tabs" == this.theLayout.type
    },
    //--------------------------------------
    thePanels() {
      let list = []

      // Join Global Panels
      this.joinThePanels(list, this.layout.panels, "G")

      // Join Current Mode Panels
      if(this.layout != this.theLayout) {
        this.joinThePanels(list, this.theLayout.panels, this.viewportMode)
      }

      // Done
      return list
    },
    //--------------------------------------
    theShown() {
      if(this.keepShownTo) {
        return this.myShown
      }
      return this.shown
    },
    //--------------------------------------
    isLoading() {
      return this.canLoading 
             && this.loadingAs 
                  ? true 
                  : false
    },
    //--------------------------------------
    showLoading() {
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
        if(this.theShown[name])
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
      console.log("updateShown", shown)
      this.syncMyShown(shown)
      this.persistMyStatus()
    },
    //--------------------------------------
    onBlockShow(name) {
      // Update privated status
      if(this.keepShownTo) {
        this.updateShown({[name]:true})
      }
      // Leave it to parent
      else {
        this.$emit("block:show", name)
      }
    },
    //--------------------------------------
    onBlockHide(name) {
      // Update privated status
      if(this.keepShownTo) {
        this.updateShown({[name]:false})
      }
      // Leave it to parent
      else {
        this.$emit("block:hide", name)
      }
    },
    //--------------------------------------
    onBlockShownUpdate(shown) {
      // Update privated status
      if(this.keepShownTo) {
        this.updateShown(shown)
      }
      // Leave it to parent
      else {
        this.$emit("block:shown", shown)
      }
    },
    //--------------------------------------
    onBlockEvent(payload) {
      this.$emit("block:event", payload)
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