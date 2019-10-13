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
    "fuse" : {
      type : Object,
      default : ()=>({
        key  : "wn-obj-form",
        noti : null
      })
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
      //console.log("wn-form.changed", payload)
      this.doAction("changed", this.updateBy, payload)
    },
    onInvalid(err) {
      //console.log("wn-form.invalid", err)
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
    if(this.fuse) {
      let failBy = this.fuse.failBy || "status.changed"
      // Defauls noti
      let noti = _.assign({
        showClose: true,
        message: Ti.I18n.get("no-saved"),
        duration : 3000,
        type: 'warning'
      }, this.fuse.noti)
      // Watch fuse
      Ti.Fuse.getOrCreate().add({
        key : this.fuse.key,
        everythingOk : ()=>{
          return !(_.get(this, failBy))
        },
        fail : ()=>{
          this.$message(noti);
        }
      })
    }
  },
  beforeDestroy : function(){
    if(this.fuse) {
      Ti.Fuse.get().remove("wn-obj-form")
    }
  }
}