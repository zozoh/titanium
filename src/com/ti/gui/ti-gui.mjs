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
    "panels" : {
      type : Array,
      default : ()=>[]
    },
    "schema" : {
      type : Object,
      default : ()=>({})
    },
    "keepStatusTo" : {
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
        "is-loading" : this.isLoading,
        "has-panels" : this.hasPanels
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
    hasPanels() {
      return !_.isEmpty(this.panels)
    },
    //--------------------------------------
    thePanels() {
      let list = []
      if(this.hasPanels) {
        for(let i=0; i<this.panels.length; i++) {
          let pan = this.panels[i]
          let pos = Ti.Util.fallback(pan.position, "center")
          list.push({
            index     : i,
            visible   : this.isShown(pan.name),
            key       : `panel-${i}`,
            transName : `ti-gui-panel-${pos}`,
            panel     : pan
          })
        }
      }
      return list
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
        if(this.myShown[name])
          return true
      }
      return false
    },
    //--------------------------------------
    updateShown(shown) {
      console.log("updateShown", shown)
      this.syncMyShown(shown)
      this.persistMyStatus()
    },
    //--------------------------------------
    onBlockShow(name) {
      this.updateShown({[name]:true})
    },
    //--------------------------------------
    onBlockHide(name) {
      this.updateShown({[name]:false})
    },
    //--------------------------------------
    onBlockShownUpdate(shown) {
      this.updateShown(shown)
    },
    //--------------------------------------
    onBlockEvent(payload) {
      this.$emit("block:event", payload)
    },
    //--------------------------------------
    syncMyShown(...showns) {
      this.myShown = _.assign({}, this.myShown, ...showns)
    },
    //--------------------------------------
    persistMyStatus() {
      if(this.keepStatusTo) {
        let status = {
          shown : _.omitBy(this.myShown, (v)=>!v)
        }
        Ti.Storage.session.setObject(this.keepStatusTo, status)
      }
    },
    //--------------------------------------
    loadMyStatus() {
      if(this.keepStatusTo) {
        let status = Ti.Storage.session.getObject(this.keepStatusTo)
        this.syncMyShown(this.shown, status.shown)
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