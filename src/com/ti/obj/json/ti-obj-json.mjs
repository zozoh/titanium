export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  props : {
    "className" : null,
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
          title : "结构",
          name  : "tree",
          body  : "desktop-tree"
        }, {
          title : "源代码",
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
    onBlockEvent({block, name, args}={}) {
      let evKey = _.concat(block||[], name||[]).join(".")
      let data = _.first(args)
      //console.log("ti-obj-json:onBlockEvent",evKey, args)
      // Ignore the undefined data
      if(_.isUndefined(data)) {
        return
      }
      // Tree Component emit changed
      if("tree.changed" == evKey) {
        this.$emit("changed", data)
      }
      // Source Component changed, it will try eval json
      else if("source.changed" == evKey) {
        let jsonData = Ti.Types.safeParseJson(data)
        if(!_.isUndefined(jsonData)) {
          this.$emit("changed", jsonData)
        }
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}