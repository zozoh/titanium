const _M = {
  //////////////////////////////////////////
  props : {
    "tabAt" : {
      type : String,
      default : "bottom-left",
      validator : (v)=>/^(top|bottom)-(left|center|right)$/.test(v)
    },
    "data" : null,
    "tree" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    theContent() {
      if(Ti.Util.isNil(this.data)) {
        return ""
      }
      return JSON.stringify(this.data, null, '  ')
    },
    //--------------------------------------
    theLayout() {
      return {
        type : "tabs",
        tabAt : this.tabAt,
        blocks : [{
          title : "i18n:structure",
          name  : "tree",
          body  : "desktop-tree"
        }, {
          title : "i18n:source-code",
          name  : "source",
          body  : "desktop-source"
        }]
      }
    },
    //--------------------------------------
    theSchema() {
      //....................................
      // Tree Conf
      let treeConf = _.assign({}, this.tree, {data: this.data})
      //....................................
      // Source Conf
      let sourceConf = {
        showTitle : false,
        content   : this.theContent
      }
      //....................................
      // Done
      return {
        "desktop-tree" : {
          comType : "ti-obj-json-tree", 
          comConf : treeConf
        },
        "desktop-source" : {
          comType : "ti-text-raw",
          comConf : sourceConf
        }
      }
      //....................................
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnChange(payload) {
      console.log("TiObjJson->OnChange", payload)
      this.$notify('change', payload)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;