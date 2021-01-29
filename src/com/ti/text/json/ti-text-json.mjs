const _M = {
  //////////////////////////////////////////
  props : {
    "tabAt" : {
      type : String,
      default : "bottom-left",
      validator : (v)=>/^(top|bottom)-(left|center|right)$/.test(v)
    },
    "value" : undefined,
    "valueType": {
      type: String,
      default: "text",
      validator: v => /^(text|obj)$/.test(v)
    },
    "jsonIndent": {
      type: String,
      default: '   '
    },
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
    TheSource() {
      if(this.TheData){
        return JSON.stringify(this.TheData, null, '   ')
      }
      return ""
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
        value    : this.TheSource
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
      //console.log("TiObjJson->OnChange", payload)
      // If string, try parse
      let val = payload
      if(_.isString(payload)) {
        try{
          val = JSON.parse(payload)
        }catch(E){
          // wait for valid input
          return
        }
      }
      // obey the valueType
      if("text" == this.valueType) {
        if(this.jsonIndent) {
          val = JSON.stringify(val, null, this.jsonIndent)
        } else {
          val = JSON.stringify(val)
        }
      }
      this.$notify('change', val)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;