export default {
  props : {
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "config" : {
      type : Object,
      default : null
    },
    "data" : {
      type : Object,
      default : null
    },
    "status" : {
      type : Object,
      default : null
    }
  },
  //////////////////////////////////////////////////////
  computed : {
    
  },
  //////////////////////////////////////////////////////
  methods : {
    onChanged(payload) {
      console.log("wn-form.changed", payload)
      let app = Ti.App(this)
      app.dispatch("main/update", payload)
    },
    onInvalid(payload) {
      console.log("wn-form.invalid", payload)
      let app = Ti.App(this)
      app.commit("main/changeStatus", {
        name    : payload.name,
        message : [payload.errMessage,payload.value].join(" :: "),
        status  : "warn"
      })
    }
  },
  //////////////////////////////////////////////////////
  mounted : function(){
    Ti.Fuse.getOrCreate().add({
      key : "wn-obj-form",
      everythingOk : ()=>{
        return !(this.status && this.status.changed)
      },
      fail : ()=>{
        this.$message({
          showClose: true,
          message: Ti.I18n.get("no-saved"),
          duration : 3000,
          type: 'warning'
        });
      }
    })
  },
  beforeDestroy : function(){
    Ti.Fuse.get().remove("wn-obj-form")
  }
}