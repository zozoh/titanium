export default {
  inheritAttrs : true,
  ////////////////////////////////////////////
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
    "showTitle" : {
      type : Boolean,
      default : true
    },
    "status" : {
      type : Object,
      default : ()=>({})
    },
    "blankText" : {
      type : String,
      default : "i18n:blank"
    }
  },
  ////////////////////////////////////////////
  computed : {
    //----------------------------------------
    theIcon() {
      if(this.meta) {
        return Wn.Util.getIconObj(this.meta)
      }
      return Ti.Icons.get()
    },
    //----------------------------------------
    theTitle() {
      if(this.meta) {
        return this.meta.title || this.meta.nm
      }
      return "no-title"
    },
    //----------------------------------------
    hasMeta() {
      return this.meta ? true : false
    }
    //----------------------------------------
  },
  ////////////////////////////////////////////
  methods : {
    onChangeContent(newContent) {
      this.$emit("changed", {content:newContent})
    }
  },
  ////////////////////////////////////////////
  mounted : function(){
    //----------------------------------------
    Ti.Fuse.getOrCreate().add({
      key : "wn-obj-puretext",
      everythingOk : ()=>{
        return !this.status.changed
      },
      fail : ()=>{
        Ti.Toast.Open("i18n:wn-obj-puretext-nosave", "warn")
      }
    })
    //----------------------------------------
  },
  ////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-obj-puretext")
  }
  ////////////////////////////////////////////
}