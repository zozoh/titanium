const _M = {
  //////////////////////////////////////////
  provide : function() {
    return {
      "$EmitBy" : (name, ...args)=>{
        this.$receive(name, args, {
          // Tree Component emit changed
          "tree>change" : (data)=>{
            this.$notify("change", data)
          },
          // Source Component changed, it will try eval json
          "source>change" : (content)=>{
            let data = Ti.Types.safeParseJson(content)
            if(!_.isUndefined(data)) {
              this.$notify("change", data)
            }
          }
        })
      }
    }
  },
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
    
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;