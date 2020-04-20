const _M = {
  //////////////////////////////////////////
  props : {
    "tabAt" : {
      type : String,
      default : "bottom-left",
      validator : (v)=>/^(top|bottom)-(left|center|right)$/.test(v)
    },
    "value" : undefined,
    "tree" : {
      type : Object,
      default : ()=>({})
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TheContent() {
      if(!Ti.Util.isNil(this.value)) {
        return this.value
      }
      return ""
    },
    //--------------------------------------
    TheData() {
      if(!Ti.Util.isNil(this.value)) {
        return Ti.Types.safeParseJson(this.value, null)
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
        value: this.TheData
      })
      //....................................
      // Source Conf
      let sourceConf = {
        showTitle : false,
        value    : this.value
      }
      //....................................
      // Done
      return {
        "desktop-tree" : {
          comType : "ti-text-json-tree", 
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