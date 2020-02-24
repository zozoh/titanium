export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  props : {
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
      // Done
      return {
        "desktop-site-tree" : {
          comType : "ti-tree", 
          comConf : {
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
          }
        },
        "desktop-site-current" : {
          comType : "hmaker-site-current-view",
          comConf : {
            home    : this.home,
            tree    : this.tree,
            currentMeta    : this.current.meta,
            currentContent : this.current.content,
            currentData    : this.current.data,
            mapping : this.theConfig.mapping,
            views   : this.config.views,
            status  : this.status
          }
        }
      }
      //....................................
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    onBlockEvent({block, name, args}={}) {
      let evKey = _.concat(block||[], name||[]).join(".")
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
        Ti.App(this).dispatch("main/setTreeSelected", data.currentId)
      }
      //....................................
      // Save Tree selected Status
      if("site-current.open" == evKey) {
        Ti.App(this).dispatch("main/reloadCurrent", data.rawData)
      }
      //....................................
      if("site-current.changed" == evKey) {
        Ti.App(this).dispatch("main/onCurrentChanged", data)
      }
      //....................................
    },
    //--------------------------------------
    editCurrentObjMeta() {
      let meta = this.current.meta || this.home

      if(!meta) {
        return Ti.Toast.Open("i18n:nil-obj")
      }

      Wn.EditObjMeta(meta)
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  mounted : function(){
    //----------------------------------------
    Ti.Fuse.getOrCreate().add({
      key : "hmaker-site-manager",
      everythingOk : ()=>{
        return !this.status.changed
      },
      fail : ()=>{
        Ti.Toast.Open("i18n:wn-obj-nosaved", "warn")
      }
    })
    //----------------------------------------
  },
  //////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Fuse.get().remove("hmaker-site-manager")
  }
  //////////////////////////////////////////
}