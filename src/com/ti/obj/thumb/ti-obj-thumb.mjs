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
    selected : {
      type : Boolean,
      default : false
    },
    loading : {
      type : Boolean,
      default : false
    },
    removed : {
      type : Boolean,
      default : false
    },
    current : {
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
        "is-selected"   : vm.selected,
        "is-renameable" : vm.renameable,
        "is-current"    : vm.current,
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
    onSelected(eo) {
      let vm = this
      let mode = "active"
      // shift key on: batch
      if(eo.shiftKey) {
        mode = "shift"
      }
      // ctrl key on: toggle
      else if(eo.ctrlKey || eo.metaKey) {
        mode = "toggle"
      }
      vm.$emit('selected', {
        mode,
        id : vm.id,
        index: vm.index, 
      })
    },
    //--------------------------------------------
    onOpen(eo) {
      let vm = this
      if(vm.selected) {
        vm.$emit('open', {
          id : vm.id,
          index: vm.index, 
        })
      }
    }
    //--------------------------------------------
  }
  ////////////////////////////////////////////////
}