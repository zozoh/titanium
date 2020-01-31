export default {
  inheritAttrs : false,
  //////////////////////////////////////////
  data : ()=>({
    theShown : {}
  }),
  //////////////////////////////////////////
  props : {
    "className" : null,
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
        tabAt : "bottom-right",
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
    doChangeShown(newShown={}) {
      this.theShown = _.assign({}, this.theShown, newShown)
    },
    //--------------------------------------
    changeTabsShown(tabs={}) {
      this.doChangeShown(tabs)
    },
    //--------------------------------------
    showBlock(name) {
      this.doChangeShown({[name]:true})
    },
    //--------------------------------------
    hideBlock(name) {
      this.doChangeShown({[name]:false})
    },
    //--------------------------------------
    onBlockEvent(be={}) {
      let evKey = _.concat(be.block, be.name).join(".")
      console.log("ti-obj-json:onBlockEvent",evKey, be)
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}