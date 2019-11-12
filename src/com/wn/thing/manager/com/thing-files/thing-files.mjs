export default {
  inheritAttrs : false,
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
    "showTitle" : {
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
          "action" : "dispatch:main/files/deleteSelected"
        },{
          "type" : "line"
        },{
          "key"  : "upload",
          "type" : "action",
          "icon" : "zmdi-cloud-upload",
          "text" : "i18n:upload",
          "action" : "commit:main/files/showUploadFilePicker"
        }]
    }
  },
  ///////////////////////////////////////////
  computed : {
    //--------------------------------------
    thePreview() {
      return _.assign({}, this.preview, {
        actions : {
          enterFullscreen : {action : "commit:main/preview/enterFullscreen"},
          exitFullscreen  : {action : "commit:main/preview/exitFullscreen"},
          download : {action : "dispatch:main/preview/download"},
          info     : {action : "main:showPreviewObjInfo"},
        }
      })
    },
    //--------------------------------------
    theFiles() {
      return _.assign({}, this.files, {
        routers : {
          "recoverExposeHidden" : "commit:main/files/recoverExposeHidden",
          "setCurrentId"        : "dispatch:main/selectCurrentPreviewItem",
          "setCheckedIds"       : "commit:main/files/setCheckedIds",
          //"selectItem"          : "dispatch:main/selectCurrentPreviewItem",
          "blurAll"             : "commit:main/files/blurAll",
          "clearUploadings"     : "commit:main/files/clearUploadings",
          "upload"              : "dispatch:main/files/upload"
        }
      })
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    //--------------------------------------
    async onUploaded(reo) {
      await Ti.App(this).dispatch('main/autoSyncCurrentFilesCount')
    },
    //--------------------------------------
    onFilesNameChanged(dirName) {
      console.log("haha")
      let app = Ti.App(this)
      app.commit("main/setFilesName", dirName)
      app.dispatch("main/reloadFiles", {force:true})
    }
    //--------------------------------------
  }
  ///////////////////////////////////////////
}