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
    "mainWidth" : {
      type : [String, Number],
      default : 200
    },
    "border" : {
      type : String,
      default : "cell",
      validator : v => /^(row|column|cell|none)$/.test(v)
    },
    "showRoot" : {
      type : Boolean,
      default : true
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
      return {
        "desktop-tree" : {
          comType : "ti-obj-json-tree", 
          comConf : {
            className : this.className,
            data      : this.data,
            mainWidth : this.mainWidth,
            border    : this.border,
            showRoot  : this.showRoot
          }
        },
        "desktop-source" : {
          comType : "ti-text-raw",
          comConf : {
            showTitle : false,
            content   : this.theContent
          }
        }
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
      console.log("ti-obj-json:onBlockEvent",evKey, args)
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