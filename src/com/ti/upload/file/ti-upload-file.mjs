const _M = {
  /////////////////////////////////////////
  data: ()=>({
    myArea: 0,
    myActionsWidth: 0
  }),
  /////////////////////////////////////////
  props : {
    // The source to display image
    "preview" : {
      type : [String, Object],
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
      default : 120
    },
    // Display height
    "height" : {
      type : [String, Number],
      default : 120
    },
    // support remove the objects
    "removable" : {
      type : Boolean,
      default : true
    },
    "areaSize": {
      type: Object,
      default: ()=>({
        //xl: (800 * 800),
        xs: (100 * 100),
        sm: (200 * 200),
        md: (400 * 400),
        lg: (600 * 600),
      })
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass(
        `is-area-${this.AreaType}`)
    },
    //--------------------------------------
    AreaType() {
      let AS = this.areaSize;
      let ar = this.myArea
      if(ar <= 0) {
        return "nil"
      }
      if(_.inRange(ar, 0, AS.xs+1))
        return "xs"
      if(_.inRange(ar, AS.xs, AS.sm+1))
        return "sm"
      if(_.inRange(ar, AS.sm, AS.md+1))
        return "md"
      if(_.inRange(ar, AS.md, AS.lg+1))
        return "lg"

      return "xl"
    },
    //--------------------------------------
    ThumbStyle(){
      return Ti.Css.toStyle({
        width  : this.width,
        height : this.height
      })
    },
    //--------------------------------------
    ActionsStyle() {
      if(/^(xs|sm)$/.test(this.AreaType)) {
        return {
          right: Ti.Css.toSize(this.myActionsWidth*-1)
        }
      }
    },
    //--------------------------------------
    hasPreview() {
      return this.preview ? true : false
    },
    //--------------------------------------
    isShowRemoveIcon() {
      if(!this.uploadFile && this.hasPreview) {
        return true
      }
      return false
    },
    //--------------------------------------
    PreviewIcon() {
      if(this.uploadFile) {
        return {type:"localFile", value:this.uploadFile}
      }
      // Normal image
      if(this.preview) {
        return this.preview
      }
      // Show Icon
      return "zmdi-plus"
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnClickToEdit() {
      this.$refs.file.click()
    },
    //--------------------------------------
    async OnDropFiles(files) {
      let file = _.get(files, 0)
      if(file) {
        this.$notify("upload", file)
      }
    },
    //--------------------------------------
    async OnSelectLocalFilesToUpload(evt) {
      await this.OnDropFiles(evt.target.files)
      this.$refs.file.value = ""
    },
    //--------------------------------------
    OnRemove() {
      this.$notify("remove")
    },
    //--------------------------------------
    OnOpen() {
      this.$notify("open")
    },
    //--------------------------------------
    recountArea() {
      let rect = Ti.Rects.createBy(this.$refs.thumb)
      this.myArea = rect.width * rect.height
      if(this.$refs.actions) {
        this.myActionsWidth = this.$refs.actions.getBoundingClientRect().width
      } else {
        this.myActionsWidth = 0
      }
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  watch: {
    "preview": function() {
      this.$nextTick(()=>this.recountArea())
    }
  },
  //////////////////////////////////////////
  mounted: function() {
    this.$nextTick(()=>this.recountArea())
  }
  //////////////////////////////////////////
}
export default _M;