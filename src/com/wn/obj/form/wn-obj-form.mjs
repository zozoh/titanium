export default {
  //////////////////////////////////////////////////////
  props : {
    "fuse" : {
      type : Object,
      default : ()=>({
        key  : "wn-obj-form",
        noti : null
      })
    },
    // {method : "dispatch", target : "main/onChanged"}
    "setDataBy" : {
      type : Object,
      default : null
    },
    // {method : "dispatch", target : "main/changeMeta"}
    "updateBy" : {
      type : Object,
      default : null
    },
    // {method : "commit", target : "main/setFieldStatus"}
    "setFieldStatusBy" : {
      type : Object,
      default : null
    }
  },
  //////////////////////////////////////////////////////
  computed : {
    isAutoShowBlank() {return Ti.Util.fallback(this.autoShowBlank, true)},
  },
  //////////////////////////////////////////////////////
  methods : {
    //--------------------------------------------------
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
    //--------------------------------------------------
    OnFieldChanged({name, value}={}) {
      //console.log("wn-obj-form.field:changed", {name, value})
      this.doAction("field:change", this.updateBy, {name, value})
    },
    //--------------------------------------------------
    OnChanged(data) {
      //console.log("wn-obj-form.changed", data)
      this.doAction("change", this.setDataBy, data)
    },
    //--------------------------------------------------
    OnInvalid(err) {
      //console.log("wn-form.invalid", err)
      let payload = {
        name    : err.name,
        message : [err.errMessage, err.value].join(" :: "),
        status  : "warn"
      }
      this.doAction("invalid", this.setFieldStatusBy, payload)
    }
    //--------------------------------------------------
  }
  //////////////////////////////////////////////////////
}