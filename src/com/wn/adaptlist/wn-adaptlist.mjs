export default {
  props : {
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "children" : {
      type : Array,
      default : ()=>[]
    },
    "currentIndex" : {
      type : Number,
      default : 0
    },
    "currentId" : {
      type : String,
      default : null
    },
    "uploadings" : {
      type : Array,
      default : ()=>[]
    },
    "pager" : {
      type : Object,
      default : ()=>({
        "pageNumber" : -1,
        "pageSize" : -1,
        "pageCount" : -1,
        "totalCoun" : -1
      })
    },
    "status" : {
      type : Object,
      default : ()=>({
        "reloading" : false,
        "deleting" : false,
        "exposeHidden" : false,
        "renaming" : false
      })
    },
    // Drop files to upload
    "droppable" : {
      type : Boolean,
      default : true
    },
    // aspect: list item spacing
    // `xs|sm|md|lg|xl`
    "spacing" : {
      type : String,
      default : "sm"
    },
    // multi-selectable
    // effected when selectable is true
    "multi" : {
      type : Boolean,
      default : true
    },
    // select item
    "selectable" : {
      type : Boolean,
      default : true
    }
  },
  //------------------------------------------------
  computed : {
    /***
     * Current Object list to show
     */
    objList() {
      let vm = this
      let list = vm.children
      let re = []
      //..........................
      if(_.isArray(list)) {

        for(let it of list) {
          // Check the visibility
          let visibility = "show"
          if(it.nm.startsWith(".")) {
            if(vm.status.exposeHidden) {
              visibility = "weak"
            } else {
              visibility = "hide"
            }
          }
          // Generate new Thumb Item
          re.push({
            id      : it.id,
            title   : Wn.Util.getObjDisplayName(it),
            preview : Wn.Util.genPreviewObj(it),
            // status
            ...(it.__is || {
              loading  : false,
              removed  : false,
              progress : -1,
              selected : false
            }),
            visibility,
            current : (it.id == vm.currentId),
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
      let list = vm.uploadings
      let re = []
      if(_.isArray(list)) {
        for(let it of list) {
          // Gen Preview for local image
          let mime = it.file.type
          let tp = Ti.Util.getSuffixName(it.file.name)
          let preview;
          if(/^image\//.test(mime)) {
            preview = {
              type : "localFile",
              value : it.file
            }
          } else {
            preview = Ti.Icons.get({tp, mime})
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
    //----------------------------------------------
    onItemOpen({id,index}={}) {
      let meta = _.nth(this.children, index)
      if(meta) {
        this.$emit("open", meta)
      }
    },
    onItemBlur() {
      this.$store.commit("main/blurAll")
    },
    //----------------------------------------------
    onDropFiles(files) {
      if(!this.droppable)
        return
      let fs = [...files]
      this.$store.dispatch("main/upload", fs)
    },
    //----------------------------------------------
    openLocalFileSelectdDialog(){
      this.$refs.file.click()
    },
    //----------------------------------------------
    onSelectLocalFilesToUpload(evt){
      this.onDropFiles(evt.target.files)
      this.$refs.file.value = ""
    }
  },
  //----------------------------------------------
  mounted : function(){
    // Guart the uploading
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
    // Restore the exposeHidden
    let $app = Ti.App(this.$root)
    $app.commit("main/recoverExposeHidden")
  },
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-list-adaptview-check-uploading")
  }
}