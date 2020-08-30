const _M = {
  ////////////////////////////////////////////////
  props : {
    index : {
      type : Number,
      default : -1
    },
    id : {
      type : String,
      default : null
    },
    // The text to present the object
    title : {
      type : String,
      default : null
    },
    // The URL of thumb
    preview : {
      type : [String, Object],
      default : "broken_image"
    },
    href : {
      type : String,
      default : null
    },
    status : {
      type : [String, Object],
      default : null
    },
    progress : {
      type : Number,
      default : -1
    },
    visibility : {
      type : String,
      default : "show"  // `show|weak|hide`
    },
    // true - alwasy show the footer part
    showFooter : {
      type : Boolean,
      default : true
    },
    badges : {
      type : Object,
      default: ()=>({
        "NW" : null,
        "NE" : null,
        "SW" : null,
        "SE" : null
      })
    }
  },
  ////////////////////////////////////////////////
  watch : {
    "preview" : function() {
      this.renderLocalFile()
    }
  },
  ////////////////////////////////////////////////
  computed : {
    //--------------------------------------------
    TopClass() {
      return this.getTopClass({
        "is-hide" : ('hide' == this.visibility),
        "is-weak" : ('weak' == this.visibility)
      }, ()=>this.status ? `is-status-${this.status}` : null)
    },
    //--------------------------------------------
    PreviewType() {
      return _.get(this.preview, "type") || "auto"
    },
    //--------------------------------------------
    isLocalFile() {
      return "localFile" == this.PreviewType
    },
    //--------------------------------------------
    isLocalImage() {
      return this.isLocalFile
        && /^image\//.test(this.LocalFile.type)
    },
    //--------------------------------------------
    LocalFile() {
      if(this.isLocalFile) {
        return this.preview.value
      }
    },
    //--------------------------------------------
    LocalFileIcon() {
      if(this.isLocalFile) {
        let file = this.LocalFile
        let oF = {
          type : Ti.Util.getSuffixName(file.name),
          mime : file.type,
          race : Ti.Util.isNil(file.type) ? "DIR" : "FILE"
        }
        return Ti.Icons.get(oF)
      }
    },
    //--------------------------------------------
    isShowProgress() {
      return this.progress>=0;
    },
    //--------------------------------------------
    ProgressTip() {
      return Ti.S.toPercent(this.progress, {fixed:1, auto:false})
    },
    //--------------------------------------------
    ProgressStyle() {
      return {width:this.ProgressTip}
    },
    //--------------------------------------------
    hasHref() {
      return this.href ? true : false
    },
    //--------------------------------------------
    TheHref() {
      return encodeURI(this.href)
    },
    //--------------------------------------------
    TheTitle() {
      return Ti.I18n.text(this.title)
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  methods : {
    //--------------------------------------------
    renderLocalFile() {
      //console.log(this.LocalFile)
      if(this.isLocalImage) {
        let reader = new FileReader();
        reader.onload = (evt)=>{
          if(this.$refs.localImage) {
            this.$refs.localImage.src = evt.target.result
          }
        }
        reader.readAsDataURL(this.preview.value);
      }
    }
    //--------------------------------------------
  },
  ////////////////////////////////////////////////
  mounted : function(){
    this.renderLocalFile()
  }
  ////////////////////////////////////////////////
}
export default _M;