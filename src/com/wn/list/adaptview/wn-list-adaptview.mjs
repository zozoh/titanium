export default {
  props : {
    "data" : {
      type : Object,
      default : ()=>({})
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    "dataIsChanged" : {
      type : Boolean,
      default : false
    }
  },
  //------------------------------------------------
  computed : {
    /***
     * Current Object list to show
     */
    objList() {
      let vm = this
      let list = vm.data.children
      let re = []
      //..........................
      if(_.isArray(list)) {
        for(let it of list) {
          re.push({
            id      : it.id,
            title   : it.nm,
            preview : Wn.Util.genPreviewObj(it),
            // status
            ...(it.__is || {
              loading  : false,
              removed  : false,
              progress : -1,
              selected : false
            }),
            current : (it.id == vm.data.currentId),
            // Icons
            icons : it.__icons || {
              NW : null,
              NE : null,
              SW : null,
              SE : null
            }
          })
        }
      }
      return re
    },
    /***
     * Show uploading list
     */
    uploadingList() {
      let vm = this
      let list = vm.data.uploadings
      let re = []
      if(_.isArray(list)) {
        for(let it of list) {
          // Gen Preview for local image
          let mime = it.file.type
          let preview;
          if(/^image\//.test(mime)) {
            preview = {
              type : "localFile",
              value : it.file
            }
          } else {
            preview = Ti.Icons.get({mime})
          }
          // Join to result list
          re.push({
            id    : it.id,
            title : it.file.name,
            preview,
            progress : (it.current/it.total)
          })
        }
      }
      return re
    },
    /***
     * has uploading
     */
    hasUploading() {
      return this.uploadingList.length > 0
    },
    uploadingClass() {
      return this.hasUploading ? "up-show" : "up-hide"
    }
  },  // ~ computed
  //------------------------------------------------
  watch: {
    "hasUploading" : function(newVal, oldVal) {
      if(true===oldVal && false===newVal) {
        this.$message({
          showClose: true,
          message: Ti.I18n.get("upload-done"),
          duration : 3000,
          type: 'success'
        });
      }
    }
  },
  //------------------------------------------------
  methods : {
    onItemSelected({mode,id,index}={}) {
      this.$store.commit("main/selectItem", {index, id, mode})
    },
    onItemOpen({id,index}={}) {
      let meta = _.nth(this.data.children, index)
      if(meta) {
        this.$emit("open", meta)
      }
    },
    onItemBlur() {
      this.$store.commit("main/blurAll")
    },
    onDropFiles(files) {
      let fs = [...files]
      this.$store.dispatch("main/upload", fs)
    },
    openFileSelectdDialog(){
      this.$refs.file.click()
    },
    onSelectFilesToUpload(evt){
      this.onDropFiles(evt.target.files)
      this.$refs.file.value = ""
    }
  },
  //------------------------------------------------
  mounted : function(){
    Ti.Fuse.getOrCreate().add({
      key : "wn-list-adaptview-check-uploading",
      everythingOk : ()=>{
        return !this.hasUploading
      },
      fail : ()=>{
        this.$message({
          showClose: true,
          message: Ti.I18n.get("upload-nofinished"),
          duration : 3000,
          type: 'warning'
        });
      }
    })
  },
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-list-adaptview-check-uploading")
  }
}