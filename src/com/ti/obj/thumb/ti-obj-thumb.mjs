const _M = {
  ////////////////////////////////////////////////
  props : {
    "index" : {
      type : Number,
      default : -1
    },
    "id" : {
      type : String,
      default : undefined
    },
    // The text to present the object
    "title" : {
      type : String,
      default : undefined
    },
    // The URL of thumb
    "preview" : {
      type : [String, Object],
      default : "broken_image"
    },
    "href" : {
      type : String,
      default : undefined
    },
    "status" : {
      type : [String, Object],
      default : undefined
    },
    "progress" : {
      type : Number,
      default : -1
    },
    "visibility" : {
      type : String,
      default : "show"  // `show|weak|hide`
    },
    // true - alwasy show the footer part
    "showFooter" : {
      type : Boolean,
      default : true
    },
    "badges" : {
      type : Object,
      default: ()=>({
        "NW" : null,
        "NE" : null,
        "SW" : null,
        "SE" : null
      })
    },
    "removeIcon" : {
      type : [String, Object],
      default : undefined
    },
    "onTitle" : {
      type : [String, Function, Boolean],
      default : undefined
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
    ThumbBadges() {
      let list = []
      _.forEach(this.badges, (v, k)=> {
        if(!v)
          return
        if(_.isString(v)) {
          list.push({
            type:"icon", value:v,
            className: `as-badge at-${k.toLowerCase()}`
          })
        } else {
          list.push({
            ...v, 
            className: [
              `as-badge at-${k.toLowerCase()}`, 
              v.className
            ].join(" ")
          })
        }
      })
      return list
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
    OnRemove() {
      let context = this.genEventContext()
      this.$notify("remove", context)
    },
    //--------------------------------------------
    OnClickTitle($event) {
      let context = this.genEventContext()
      // String -> Emit event
      if(false === this.onTitle) {
        $event.stopPropagation()
      }
      // Notify
      else if(_.isString(this.onTitle)) {
        this.$notify(this.onTitle, context)
      }
      // Function -> Handle
      else if(_.isFunction(this.onTitle)) {
        $event.stopPropagation()
        this.onTitle(context)
      }
    },
    //--------------------------------------------
    genEventContext() {
      return {
        index: this.index,
        id: this.id,
        title: this.title
      }
    },
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