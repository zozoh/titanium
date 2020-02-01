export default {
  inheritAttrs : false,
  /////////////////////////////////////////
  data: ()=>({
    myShown : {}
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
    "inBlock" : {
      type : Boolean,
      default : false
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
      }, [
        `as-${this.type}`
      ], this.className)
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
        for(let pan of this.panels) {
          if(this.isShown(pan.name)) {
            list.push(pan)
          }
        }
      }
      return list
    },
    //--------------------------------------
    theShown() {
      return this.inBlock
        ? this.shown
        : this.myShown
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
        if(this.shown[name])
          return true
      }
      return false
    },
    //--------------------------------------
    updateShown(shown) {
      if(!this.inBlock) {
        this.syncMyShown(shown)
        this.persistMyStatus()
      }
    },
    //--------------------------------------
    onBlockShow(name) {
      if(this.inBlock) {
        this.$emit("block:show", name)
      }
      // Update privated
      else {
        this.updateShown({[name]:true})
      }
    },
    //--------------------------------------
    onBlockHide(name) {
      if(this.inBlock) {
        this.$emit("block:hide", name)
      }
      // Update privated
      else {
        this.updateShown({[name]:false})
      }
    },
    //--------------------------------------
    onBlockShownUpdate(shown) {
      if(this.inBlock) {
        this.$emit("block:shown", shown)
      }
      // Update privated
      else {
        this.updateShown(shown)
      }
    },
    //--------------------------------------
    onBlockEvent(payload) {
      this.$emit("block:event", payload)
    },
    //--------------------------------------
    syncMyShown(...showns) {
      if(!this.inBlock) {
        this.myShown = _.assign({}, this.myShown, ...showns)
      }
    },
    //--------------------------------------
    persistMyStatus() {
      if(!this.inBlock && this.keepStatusTo) {
        let status = {
          shown : _.omitBy(this.myShown, (v)=>!v)
        }
        Ti.Storage.session.setObject(this.keepStatusTo, status)
      }
    },
    //--------------------------------------
    loadMyStatus() {
      if(!this.inBlock && this.keepStatusTo) {
        let status = Ti.Storage.session.getObject(this.keepStatusTo)
        this.syncMyShown(this.shown, status.shown)
      }
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
    this.loadMyStatus()
  }
  //////////////////////////////////////////
}