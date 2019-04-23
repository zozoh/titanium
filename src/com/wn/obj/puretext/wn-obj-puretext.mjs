export default {
  props : {
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "content" : {
      type : String,
      default : null
    },
    "savedContent" : {
      type : String,
      default : null
    },
    "contentType" : {
      type : String,
      default : null
    },
    "status" : {
      type : Object,
      default : ()=>({
        "changed"   : false,
        "saving"    : false,
        "reloading" : false
      })
    }
  },
  computed : {
    theIcon() {
      if(this.meta) {
        return Wn.Util.getIconObj(this.meta)
      }
      return Ti.Icons.get()
    },
    theTitle() {
      if(this.meta) {
        return this.meta.title || this.meta.nm
      }
      return "no-title"
    }
  },
  methods : {
    onChangeContent(newContent) {
      this.$emit("change", {content:newContent})
    }
  },
  mounted : function(){
    Ti.Fuse.getOrCreate().add({
      key : "wn-obj-puretext",
      everythingOk : ()=>{
        return !this.status.changed
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