const _M = {
  ///////////////////////////////////////////
  provide : function() {
    return {
      "$gui" : this
    }
  },
  /////////////////////////////////////////
  data: ()=>({
    $inner : undefined,
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
    "shownEmitName" : {
      type : String,
      default : undefined
    },
    "shownNotifyName" : {
      type : String,
      default : undefined
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
      let lay = {}
      if(_.isEmpty(this.layout))
        return lay
      //....................................
      // Raw layout
      if(/^(rows|cols|tabs)$/.test(this.layout.type)) {
        lay = this.layout
      }
      //....................................
      // Auto adapt viewMode
      else {
        lay = this.layout[this.viewportMode]
        // Refer onece
        if(_.isString(lay)) {
          lay = this.layout[lay]
        }
        // Refer twice (I think it is enough for most of cases)
        if(_.isString(lay)) {
          lay = this.layout[lay]
        }
      }
      //....................................
      // Filter block
      lay.blocks = this.filterBlocks(lay.blocks)
      //....................................
      // Done
      return lay || {}
    },
    //--------------------------------------
    isRowsLayout() {return "rows"==this.TheLayout.type},
    isColsLayout() {return "cols"==this.TheLayout.type},
    isTabsLayout() {return "tabs"==this.TheLayout.type},
    //--------------------------------------
    BlockNames() {
      if(!this.layout) {
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
    OnMainTypeInit($innerCom) {
      this.$inner = $innerCom
    },
    //--------------------------------------
    joinBlockNames(names={}, blocks=[]) {
      _.forEach(blocks, ({name, blocks}={}) => {
        if(name) {
          names[name] = true
        }
        if(_.isArray(blocks)) {
          this.joinBlockNames(names, blocks)
        }
      })
      return names;
    },
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
    filterShown(shown={}) {
      return _.omitBy(shown, (v, k)=>{
        if(!v)
          return true
        if(!this.BlockNames[k])
          return true
        return false
      })
    },
    //--------------------------------------
    syncMyShown(...showns) {
      if(this.keepShownTo) {
        let shown  = _.assign({}, this.myShown, ...showns)
        this.myShown = shown
        if(this.shownEmitName) {
          this.$emit(this.shownEmitName, this.myShown)
        }
  
        if(this.shownNotifyName) {
          this.$notify(this.shownNotifyName, this.myShown)
        }
      }
    },
    //--------------------------------------
    persistMyStatus() {
      if(this.keepShownTo) {
        let shown = this.filterShown(this.myShown)
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
    filterBlocks(blocks) {
      let reBlocks = []
      _.forEach(blocks, bl => {
        let isShow = true
        if(bl.name) {
          isShow = _.get(this.TheShown, bl.name)
          isShow = Ti.Util.fallback(isShow, true)
        }
        if(isShow) {
          reBlocks.push(bl)
          if(bl.blocks) {
            bl.blocks = this.filterBlocks(bl.blocks)
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
      if(this.myBlockMap[name]) {
        delete this.myBlockMap[name]
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "shown" : {
      handler : function(shown) {
        //console.log("ti-gui shown changed", shown)
        this.syncMyShown(shown)
      },
      immediate : true
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