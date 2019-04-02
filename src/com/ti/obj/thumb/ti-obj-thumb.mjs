export default {
  props : {
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
    highlight : {
      type : Boolean,
      default : false
    },
    index : {
      type : Number,
      default : -1
    }
  },
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
  computed : {
    classObject() {
      let vm = this
      return {
        "is-highlight"  : vm.highlight,
        "is-renameable" : vm.renameable
      }
    }
  },
  methods : {
    onTopSelect(eo) {
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
      vm.$emit('selected', vm.index, mode)
    },
    onTopOpen(eo) {
      let vm = this
      if(vm.highlight) {
        vm.$emit('open', vm.index)
      }
    }
  }
}