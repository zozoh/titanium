export default {
  inheritAttrs : false,
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
    }
  },
  //////////////////////////////////////////
  computed : {
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
          name  : "site-item",
          body  : "desktop-site-item"
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
      let siteItemConf = {
        value : this.tree
      }
      //....................................
      // Done
      return {
        "desktop-site-tree" : {
          comType : "ti-tree", 
          comConf : siteTreeConf
        },
        "desktop-site-item" : {
          comType : "ti-label",
          comConf : siteItemConf
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
        Ti.App(this).dispatch("main/persistTreeOpenedNodePaths", data)
      }
      //....................................
      // Save Tree selected Status
      if("site-tree.selected" == evKey) {
        Ti.App(this).dispatch("main/persistTreeSelected", data)
      }
      //....................................
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}