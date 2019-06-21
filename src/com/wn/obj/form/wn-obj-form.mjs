export default {
  props : {
    // Just hide the income properties
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    // The 3 properties below are really useful
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
      default : ()=>({})
    },
    "fieldStatus" : {
      type : Object,
      default : ()=>({})
    },
    "updateBy" : {
      type : Object,
      default : ()=>({
        method : "dispatch",
        target : "main/update"
      })
    },
    "setFieldStatusBy" : {
      type : Object,
      default : ()=>({
        method : "commit",
        target : "main/setFieldStatus"
      })
    }
  },
  //////////////////////////////////////////////////////
  computed : {
    hasData() {
      return !_.isEmpty(this.data)
    }
  },
  //////////////////////////////////////////////////////
  methods : {
    doAction(emitName, action, payload) {
      if(action) {
        let app = Ti.App(this)
        app[action.method](action.target, payload)
      }
      // Just notify $parent
      else {
        this.$emit(emitName, payload)
      }
    },
    onChanged(payload) {
      console.log("wn-form.changed", payload)
      this.doAction("changed", this.updateBy, payload)
    },
    onInvalid(err) {
      console.log("wn-form.invalid", payload)
      let payload = {
        name    : err.name,
        message : [err.errMessage, err.value].join(" :: "),
        status  : "warn"
      }
      this.doAction("invalid", this.setFieldStatusBy, payload)
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