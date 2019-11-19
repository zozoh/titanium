export default {
  inheritAttrs : false,
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
      type : Object,
      default : ()=>({
        type : "icon",
        value : "broken_image"
      })
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
    footer : {
      type : Boolean,
      default : true
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
    classObject() {
      let vm = this
      return {
        "is-removed"    : vm.removed,
        "is-loading"    : vm.loading,
        "is-hide" : ('hide' == vm.visibility),
        "is-weak" : ('weak' == vm.visibility)
      }
    },
    showProgress() {
      return this.progress>=0;
    },
    progressTip() {
      return Ti.S.toPercent(this.progress, {fixed:1, auto:false})
    },
    progressStyleObj() {
      return {width:this.progressTip}
    }
  },
  ////////////////////////////////////////////////
  methods : {
    //--------------------------------------------
    onClickTitle($event) {
      //console.log("onClickTitle", $event)
      this.$emit("selected", {
        index : this.index,
        id : this.id,
        $event : $event
      })
    },
    //--------------------------------------------
    renderLocalFile() {
      if('localFile' == this.preview.type) {
        let reader = new FileReader();
        reader.onload = (evt)=>{
          this.$refs.localImage.src = evt.target.result
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