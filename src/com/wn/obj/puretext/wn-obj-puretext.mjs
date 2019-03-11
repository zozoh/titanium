export default {
  props : {
    data : {
      type : Object,
      default : ()=>({
        "meta" : null,
        "content" : null,
        "contentType" : null
      })
    }
  },
  computed : {
    obj() {
      let vm = this;
      if(vm.data && vm.data.meta) {
        return {
          icon  : Wn.Util.getIconObj(this.data.meta),
          title : vm.data.meta.title || vm.data.meta.nm
        }
      }
      return {
        icon  : Ti.Icons.get(),
        title : "no-title"
      }
    }  // ~ obj()
  },
  methods : {
    onChangeContent(newContent) {
      this.$emit("change", {content:newContent})
    }
  }
}