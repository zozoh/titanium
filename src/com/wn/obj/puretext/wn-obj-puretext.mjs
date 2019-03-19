export default {
  props : {
    "data" : {
      type : Object,
      default : ()=>({
        "meta" : null,
        "content" : null,
        "contentType" : null
      })
    },
    "dataIsChanged" : {
      type : Boolean,
      default : false
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
  },
  mounted : function(){
    Ti.Fuse.getOrCreate().add({
      key : "wn-obj-puretext",
      check : ()=>{
        return !this.dataIsChanged
      },
      fail : ()=>{
        this.$message({
          showClose: true,
          message: Ti.I18n.get("wn-obj-puretext-nosave"),
          duration : 3000,
          type: 'warning'
        });
      }
    })
  },
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-obj-puretext")
  }
}