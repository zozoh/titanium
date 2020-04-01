const _M = {
  //////////////////////////////////////////
  props : {
    "tabAt" : {
      type : String,
      default : "bottom-left",
      validator : (v)=>/^(top|bottom)-(left|center|right)$/.test(v)
    },
    "data" : undefined,
    "content" : undefined,
    "tree" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TheContent() {
      if(!Ti.Util.isNil(this.content)) {
        return this.content
      }
      if(!Ti.Util.isNil(this.data)) {
        return JSON.stringify(this.data, null, '  ')
      }
      return ""
    },
    //--------------------------------------
    TheData() {
      if(!Ti.Util.isNil(this.content)) {
        return Ti.Types.safeParseJson(this.content, null)
      }
      if(!Ti.Util.isNil(this.data)) {
        return this.data
      }
      return null
    },
    //--------------------------------------
    TheLayout() {
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
    TheSchema() {
      //....................................
      // Tree Conf
      let treeConf = _.assign({}, this.tree, {
        data: this.TheData
      })
      //....................................
      // Source Conf
      let sourceConf = {
        showTitle : false,
        content   : this.content
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