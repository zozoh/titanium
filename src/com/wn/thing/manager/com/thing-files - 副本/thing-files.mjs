const _M = {
  ///////////////////////////////////////////
  provide : {
    primaryNotify: true
  },
  ///////////////////////////////////////////
  props : {
    "filesName" : {
      type : String,
      default : "media"
    },
    "files" : {
      type : Object,
      default : ()=>({})
    },
    "preview" : {
      type : Object,
      default : ()=>({
        meta   : null,
        status : {}
      })
    },
    "previewInfo" : {
      type : Object,
      default : ()=>({})
    },
    "previewInfoEdit" : {
      type : Object,
      default : ()=>({})
    },
    "dirNameTip" : {
      type : String,
      default : "i18n:thing-files"
    },
    "dirNameComType" : {
      type : String,
      default : "ti-droplist"
    },
    "dirNameOptions" : {
      type : Array,
      default : ()=>[{
        icon  :"zmdi-collection-image",
        text  :"i18n:media",
        value : "media"
      }, {
        icon  :"zmdi-attachment-alt",
        text  :"i18n:attachment",
        value : "attachment"
      }]
    },
    "actionMenuData" : {
      type : Array,
      default : ()=>[{
          "key"  : "reloading",
          "type" : "action",
          "icon" : "zmdi-refresh",
          "tip" : "i18n:refresh",
          "altDisplay" : {
            "icon" : "zmdi-refresh zmdi-hc-spin"
          },
          "action" : "dispatch:main/files/reload"
        },{
          "type" : "line"
        }, {
          "key"  : "deleting",
          "type" : "action",
          "icon" : "zmdi-delete",
          "text" : "i18n:del",
          "altDisplay" : {
            "icon" : "zmdi-refresh zmdi-hc-spin",
            "text" : "i18n:del-ing"
          },
          "action" : "$parent:doDeleteSelected"
        },{
          "type" : "line"
        },{
          "key"  : "upload",
          "type" : "action",
          "icon" : "zmdi-cloud-upload",
          "text" : "i18n:upload",
          //"action" : "commit:main/files/showUploadFilePicker"
          "action" : "$parent:doUploadFiles"
        }]
    },
    "stateLocalKey" : {
      type : String,
      default : null
    }
  },
  ///////////////////////////////////////////
  computed : {
    //--------------------------------------
    thePreview() {
      let theInfo = Ti.Util.getFallback(
        this.previewInfo, 
        this.filesName, 
        "@default")

      return _.assign({
        showInfo  : false,
        floatInfo : false,
        infoPosition  : "left",
        infoNameWidth : 40,
        infoValueWidth : 120,
        stateLocalKey : this.stateLocalKey
      }, this.preview, theInfo, {
        editInfoBy : ()=>{
          this.editPreviewInfo()
        }
      })
    },
    //--------------------------------------
    theFiles() {
      return _.assign({}, this.files, {
        routers : {
          "reload" : "dispatch:main/files/reload"
        }
      })
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnAdaptListInit($adaptList){this.$adaptList = $adaptList},
    //--------------------------------------
    async doDeleteSelected(){
      await this.$adaptList.doDelete()
    },
    //--------------------------------------
    doUploadFiles() {
      this.$adaptList.openLocalFileSelectdDialog()
    },
    //--------------------------------------
    OnFileSelected({current}) {
      console.log(current)
      Ti.App(this).dispatch('main/selectCurrentPreviewItem', current)
    },
    //--------------------------------------
    OnFileUploaded(...args){
      console.log("OnFileUploaded", args)
    },
    //--------------------------------------
    async editPreviewInfo() {
      //console.log("showPreviewObjInfo:", this.preview)
      if(this.preview.meta) {
        let options = _.get(this.previewInfoEdit, this.filesName)
        let newMeta = await Wn.EditObjMeta(this.preview.meta, options)
        if(newMeta) {
          let app = Ti.App(this)
          app.dispatch("main/preview/reload", newMeta)
          app.commit("main/files/updateItem", newMeta)
        }
      }
    },
    //--------------------------------------
    onFilesNameChanged(dirName) {
      let app = Ti.App(this)
      app.commit("main/setFilesName", dirName)
      app.dispatch("main/reloadFiles", {force:true})
    },
    //--------------------------------------
    openLocalFileSelectdDialog() {
      for(let $child of this.$children) {
        if(Ti.Dom.hasClass($child.$el, "wn-adaptlist")
           && _.isFunction($child.openLocalFileSelectdDialog)) {
          $child.openLocalFileSelectdDialog();
        }
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  mounted : function() {
    let $p = this.$parent
    // Find the thing root app
    while($p && !$p.THING_MANAGER_ROOT) {
      $p = $p.$parent
    }
    // append self
    if($p && $p.THING_MANAGER_ROOT) {
      $p.$thingFiles = this
    }
  }
  ///////////////////////////////////////////
}
export default _M