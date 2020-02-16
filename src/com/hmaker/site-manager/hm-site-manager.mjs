/////////////////////////////////////////////
class HmViewMapping {
  constructor(mapping) {
    this.types = new Ti.Mapping(mapping.types)
    this.mimes = new Ti.Mapping(mapping.mimes)
    this.races = new Ti.Mapping(mapping.races)
  }
  getView(meta, dft) {
    let view;
    // Try meta
    if(meta) {
      // By Type
      view = this.types.get(meta.tp)
      // By Mimes
      if(_.isUndefined(view)) {
        view = this.mimes.get(meta.mime)
      }
      // By Race
      if(_.isUndefined(view)) {
        view = this.races.get(meta.race)
      }
    }
    // By Default
    if(_.isUndefined(view)) {
      view = dft
    }
    // Done
    return view
  }
}
/////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////
  data : ()=>({
    myActions : null,
    myCooling : -1,
    myCurrentView : null
  }),
  //////////////////////////////////////////
  props : {
    "className" : null,
    "home" : {
      type : Object,
      default : null
    },
    "tree" : {
      type : Object,
      default : ()=>({})
    },
    "current" : {
      type : Object,
      default : ()=>({})
    },
    "config" : {
      type : Object,
      default : ()=>({})
    },
    "status" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    theConfig() {
      return this.config[this.viewportMode] || {}
    },
    //--------------------------------------
    theViewsMapping() {
      let mapping = this.theConfig.mapping || {}
      return new HmViewMapping(mapping)
    },
    //--------------------------------------
    theLayout() {
      return {
        type : "cols",
        border : true,
        blocks : [{
          title : "i18n:hmaker-site-tree",
          size  : 280,
          name  : "site-tree",
          body  : "desktop-site-tree"
        }, {
          name  : "site-current",
          body  : "desktop-site-current"
        }]
      }
    },
    //--------------------------------------
    theSchema() {
      //....................................
      // Tree Conf
      let siteTreeConf = _.assign({
        //=========================
        data : this.tree.root,
        //=========================
        display : [{
            key : "rawData",
            type : "Object",
            transformer : "getIconObj",
            comType : "ti-icon"
          },
          "rawData.title",
          "name"],
        //=========================
        blankAs : {
          icon : "zmdi-settings zmdi-hc-spin",
          text : "i18n:hmaker-site-tree-loading"
        },
        //=========================
        currentId : this.tree.currentId,
        showRoot:false,
        defaultOpenDepth : 1,
        extendFunctionSet : Wn.Util,
        openedNodePaths : this.tree.openedNodePaths
        //=========================
      })
      //....................................
      // Source Conf
      // It will watch the myCurrentView
      //....................................
      // Done
      return {
        "desktop-site-tree" : {
          comType : "ti-tree", 
          comConf : siteTreeConf
        },
        "desktop-site-current" : this.myCurrentView
      }
      //....................................
    },
    //--------------------------------------
    hasCurrent() {
      return this.current && this.current.meta
    },
    //--------------------------------------
    theCurrentIcon() {
      if(this.hasCurrent) {
        return Wn.Util.getIconObj(this.current.meta)
      }
    },
    //--------------------------------------
    theCurrentTitle() {
      if(this.hasCurrent) {
        return Wn.Util.getObjDisplayName(this.current.meta)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    onBlockEvent({block, name, args}={}) {
      let evKey = _.concat(block, name).join(".")
      let data = _.first(args)
      console.log("hmaker-site-manager:onBlockEvent",evKey, data)
      //....................................
      // Ignore the undefined data
      if(_.isUndefined(data)) {
        return
      }
      //....................................
      // Opened Node
      if("site-tree.opened" == evKey) {
        Ti.App(this).dispatch("main/reloadTreeNode", {id:data.id})
      }
      //....................................
      // Save Tree opened Status
      if("site-tree.opened-status:changed" == evKey) {
        Ti.App(this).dispatch("main/setTreeOpenedNodePaths", data)
      }
      //....................................
      // Save Tree selected Status
      if("site-tree.selected" == evKey) {
        Ti.App(this).dispatch("main/setTreeSelected", data)
      }
      //....................................
      if("site-current.changed" == evKey) {
        Ti.App(this).dispatch("main/onCurrentChanged", data)
      }
      //....................................
    },
    //--------------------------------------
    evalCurrentView() {
      let view = {
        comType : "ti-label",
        comConf : {
          value : "=current.meta"
        }
      }
      if(this.hasCurrent) {
        view = this.theViewsMapping.getView(this.current.meta, view)
      }
      if(_.isString(view)) {
        view = {
          comType : view,
          comConf : {
            icon  : "=theCurrentIcon",
            title : "=theCurrentTitle",
            meta  : "=current.meta",
            data  : "=current.data",
            content : "=current.content",
            contentIsChanged : "=current.status.changed"
          }
        }
      }
      this.$nextTick(()=>{
        this.myCurrentView = Ti.Util.explainObj(this, view)
      })
    },
    //--------------------------------------
    setMyActions(actions) {
      this.myActions = _.cloneDeep(actions)
      this.myCooling = Date.now()
    },
    //--------------------------------------
    checkActionsUpdate() {
      //console.log("checkActionsUpdate")
      // Not need to check
      if(this.myCooling < 0) {
        return
      }
      // Wait cooling 1000ms
      if(Date.now() - this.myCooling > 300) {
        this.$emit("actions:updated", this.myActions)
        this.myCooling = -1
      }
      // Wait cooling 1000ms
      else {
        _.delay(()=>{
          this.checkActionsUpdate()
        }, 200)
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch : {
    "theConfig.actions" : function(newActions, oldActions) {
      //console.log("theConfig.actions", this.theConfig.actions)
      if(!_.isEqual(newActions, oldActions)) {
        this.setMyActions(newActions)
      }
    },
    // To prevent the action update too often
    "myCooling" : function(cooling) {
      if(cooling > 0) {
        this.checkActionsUpdate()
      }
    },
    // current changed
    "current.meta" : function() {
      console.log("watch current.meta")
      this.evalCurrentView()
    }
  },
  //////////////////////////////////////////
  mounted : function() {
    this.setMyActions(this.theConfig.actions)
    this.evalCurrentView()
  }
  //////////////////////////////////////////
}