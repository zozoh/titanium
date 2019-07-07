export default {
  inheritAttrs : false,
  ///////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : null
    },
    "filter" : {
      type : Object,
      default : null
    },
    "sorter" : {
      type : Object,
      default : null
    },
    "pager" : {
      type : Object,
      default : null
    },
    "list" : {
      type : Array,
      default : ()=>[]
    },
    "currentId" : {
      type : String,
      default : null
    },
    "checkedIds" : {
      type : Array,
      default : ()=>[]
    },
    "uploadings" : {
      type : Array,
      default : ()=>[]
    },
    "uploadDialog" : {
      type : Boolean,
      default : false
    },
    "status" : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////////
  computed : {
    //--------------------------------------
    routers() {
      return {
        "recoverExposeHidden" : "commit:main/files/recoverExposeHidden",
        "setCurrentId"        : "commit:main/files/setCurrentId",
        "setCheckedIds"       : "commit:main/files/setCheckedIds",
        "selectItem"          : "commit:main/files/selectItem",
        "blurAll"             : "commit:main/files/blurAll",
        "clearUploadings"     : "commit:main/files/clearUploadings",
        "upload"              : "dispatch:main/files/upload"
      }
    },
    //--------------------------------------
    currentFile() {
      if(!_.isEmpty(this.list)) {
        for(let f of this.list) {
          if(f.id == this.currentId) {
            return f
          }
        }
      }
    }
    //--------------------------------------
  },
  ///////////////////////////////////////////
  methods : {
    async onUploaded(reo) {
      await Ti.App(this).dispatch('main/autoSyncCurrentFilesCount')
    }
  }
  ///////////////////////////////////////////
}