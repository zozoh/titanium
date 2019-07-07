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
    loading : {
      type : Boolean,
      default : false
    },
    removed : {
      type : Boolean,
      default : false
    },
    progress : {
      type : Number,
      default : -1
    },
    visibility : {
      type : String,
      default : "show"  // `show|weak|hide`
    }
  },
  ////////////////////////////////////////////////
  mounted : function(){
    let vm = this
    if('localFile' == vm.preview.type) {
      let reader = new FileReader();
      reader.onload = function(evt) {
        vm.$refs.localImage.src = evt.target.result
      }
      reader.readAsDataURL(vm.preview.value);
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
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}