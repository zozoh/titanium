export default {
  inheritAttrs : false,
  //////////////////////////////////////////////////////
  props : {
    "icon" : {
      type : String,
      default : null
    },
    "title" : {
      type : String,
      default : null
    },
    "className" : {
      type : String,
      default : null
    },
    "display" : {
      type : String,
      default : "all"
    },
    "currentTab" : {
      type : Number,
      default : 0
    },
    "config" : {
      type : Object,
      default : null
    },
    "data" : {
      type : Object,
      default : null
    },
    // "status" : {
    //   type : Object,
    //   default : ()=>({})
    // },
    "fieldStatus" : {
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
      //console.log("wn-obj-form.changed", payload)
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
      // Watch fuse
      Ti.Fuse.getOrCreate().add({
        key : this.fuse.key,
        everythingOk : ()=>{
          return !(_.get(this, failBy))
        },
        fail : ()=>{
          Ti.Toast.Open("i18n:no-saved", "warn")
        }
      })
    }
  },
  beforeDestroy : function(){
    if(this.fuse) {
      Ti.Fuse.get().remove(this.fuse.key)
    }
  }
}