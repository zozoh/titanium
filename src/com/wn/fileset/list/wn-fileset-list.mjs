import WnIo from "../../../../lib/walnut/wn-io.mjs"

export default {
  ////////////////////////////////////////////////////
  data: ()=>({
    myLoading : undefined,
    listData : [],
    currentMeta : undefined,
    currentContent : undefined
  }),
  ////////////////////////////////////////////////////
  props : {
    "match" : {
      type : Object,
      default : ()=>({
        race : "FILE"
      })
    },
    "listSize" : {
      type : [Number, String],
      default : 0.3
    },
    "listIcon" : {
      type : String,
      default : "far-list-alt"
    },
    "listTitle" : {
      type : String,
      default : "i18n:list"
    },
    "listType" : {
      type : String,
      default : "TiList"
    },
    "listConf" : {
      type : Object,
      default : ()=>({})
    },
    "metaSize" : {
      type : [Number, String],
      default : 0.3
    },
    "metaIcon" : {
      type : String,
      default : "fas-info-circle"
    },
    "metaTitle" : {
      type : String,
      default : "i18n:meta"
    },
    "metaType" : {
      type : String,
      default : "TiForm"
    },
    "metaConf" : {
      type : Object,
      default : ()=>({})
    },
    "detailSize" : {
      type : [Number, String],
      default : undefined
    },
    "detailIcon" : {
      type : String,
      default : "fas-info-circle"
    },
    "detailTitle" : {
      type : String,
      default : "i18n:detail"
    },
    "detailType" : {
      type : String,
      default : "TiTextRaw"
    },
    "detailConf" : {
      type : Object,
      default : ()=>({})
    }
  },
  ////////////////////////////////////////////////////
  computed : {
    //------------------------------------------------
    GUILayout() {
      let listBlock = {
        title : this.listTitle,
        icon  : this.listIcon,
        name  : "list",
        size  : this.listSize,
        body  : "list"
      }
      let metaBlock = {
        title : this.metaTitle,
        icon  : this.metaIcon,
        size  : this.metaSize,
        name  : "meta",
        body  : "meta"
      }
      let detailBlock = {
        title : this.detailTitle,
        icon  : this.detailIcon,
        size  : this.detailSize,
        name  : "detail",
        body  : "detail"
      }
      if(this.metaType && this.detailType) {
        return {
          type : "cols",
          border : true,
          blocks : [listBlock, {
              type : "rows",
              border : true,
              blocks : [metaBlock, detailBlock]
            }]
        }
      }
      if(this.metaType) {
        return {
          type : "cols",
          className : "show-border",
          blocks : [listBlock, metaBlock]
        }
      }
      return {
        type : "cols",
        className : "show-border",
        blocks : [listBlock, detailBlock]
      }
    },
    //------------------------------------------------
    GUISchema() {
      //..............................................
      let listConf = _.defaults({}, this.listConf, {
        display : ["<icon:far-file>", "title|nm"],
        data : "=listData"
      })
      //..............................................
      let metaConf = _.defaults({}, this.metaConf, {
        autoShowBlank : true,
        blankAs : {
          icon : "fas-brush",
          text : "i18n:blank-to-edit"
        },
        data : "=currentMeta",
        fields : [{
          title: "i18n:wn-key-title",
          name : "title",
          comType : "ti-input"
        }, {
          title: "i18n:wn-key-nm",
          name : "nm",
          comType : "ti-input"
        }]
      })
      //..............................................
      let detailConf = _.defaults({}, this.detailConf, {
        value : "=currentContent"
      })
      //..............................................
      return {
        list : {
          comType : this.listType,
          comConf : Ti.Util.explainObj(this, listConf)
        },
        meta : {
          comType : this.metaType,
          comConf : Ti.Util.explainObj(this, metaConf)
        },
        detail : {
          comType : this.detailType,
          comConf : Ti.Util.explainObj(this, detailConf)
        }
      }
    }
    //------------------------------------------------
  },
  ////////////////////////////////////////////////////
  methods : {
    //------------------------------------------------
    async OnListSelect({current}) {
      this.currentMeta = current
      this.myLoading = true
      this.currentContent = await Wn.Io.loadContent(current, {as:"text"})
      this.myLoading = false
    },
    //------------------------------------------------
    OnListOpen() {
      // need to do nothing
    },
    //------------------------------------------------
    OnDetailChange() {
      
    },
    //------------------------------------------------
    async reload() {
      console.log("reload fileset list")
      this.listData = await this.reloadChildren()
    }
    //------------------------------------------------
  }
  ////////////////////////////////////////////////////
}