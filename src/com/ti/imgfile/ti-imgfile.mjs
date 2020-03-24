export default {
  /////////////////////////////////////////
  data : ()=>({

  }),
  /////////////////////////////////////////
  props : {
    // The source to display image
    "src" : {
      type : String,
      default : null
    },
    // The value must be a LocalFile object
    // to prerender the LocalFile during uploading
    "uploadFile" :{
      type : File,
      default : null
    },
    // Show the process `0.0-1.0` during the uploading
    "progress" : {
      type : Number,
      default : -1
    },
    // Display width
    "width" : {
      type : [String, Number],
      default : 100
    },
    // Display height
    "height" : {
      type : [String, Number],
      default : 100
    },
    // support remove the objects
    "removable" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    showRemoveIcon() {
      if(!this.uploadFile && this.src) {
        return true
      }
      return false
    },
    //--------------------------------------
    preview() {
      if(this.uploadFile) {
        return {type:"localFile", value:this.uploadFile}
      }
      // Normal image
      if(this.src) {
        return {type:"image", value:this.src}
      }
      // Show Icon
      return {type:"font", value:"zmdi-plus"}
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    onClickToEdit() {
      this.$refs.file.click()
    },
    //--------------------------------------
    async onDropFiles(files) {
      let file = _.get(files, 0)
      if(file) {
        this.$notify("upload", file)
      }
    },
    //--------------------------------------
    async onSelectLocalFilesToUpload(evt) {
      await this.onDropFiles(evt.target.files)
      this.$refs.file.value = ""
    },
    //--------------------------------------
    onRemove() {
      this.$notify("remove")
    },
    //--------------------------------------
    onOpen() {
      this.$notify("open")
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}