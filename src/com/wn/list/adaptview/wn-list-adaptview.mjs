export default {
  props : {
    data : {
      type : Object,
      default : ()=>({})
    }
  },
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
            ...(it.__is || {
              loading : false,
              process : -1,
              selected : false
            }),
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
            process : (it.current/it.total)
          })
        }
      }
      console.log("uploadingList", re)
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
  methods : {
    onItemSelected(index, mode) {
      this.$store.commit("main/selectItem", {index, mode})
    },
    onItemOpen(index) {
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
  }
}