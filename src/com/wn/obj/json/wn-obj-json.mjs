export default {
  inheritAttrs : true,
  ////////////////////////////////////////////
  props : {
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "data" : undefined,
    "content" : undefined,
    "status" : {
      type : Object,
      default : ()=>({})
    }
  },
  ////////////////////////////////////////////
  computed : {
    //----------------------------------------
    hasMeta() {
      return this.meta ? true : false
    }
    //----------------------------------------
  },
  ////////////////////////////////////////////
  methods : {
    onChangeContent(newData) {
      this.$notify("change", newData)
    }
  },
  ////////////////////////////////////////////
  mounted : function(){
    //----------------------------------------
    Ti.Fuse.getOrCreate().add({
      key : "wn-obj-json",
      everythingOk : ()=>{
        return !this.status.changed
      },
      fail : ()=>{
        Ti.Toast.Open("i18n:wn-obj-nosaved", "warn")
      }
    })
    //----------------------------------------
  },
  ////////////////////////////////////////////
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-obj-json")
  }
  ////////////////////////////////////////////
}