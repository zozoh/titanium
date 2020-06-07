const _M = {
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
      type : [String, Object, Boolean],
      default : null
    },
    // {method : "dispatch", target : "main/changeMeta"}
    "updateBy" : {
      type : [String, Object, Boolean],
      default : null
    },
    // {method : "commit", target : "main/setFieldStatus"}
    "setFieldStatusBy" : {
      type : [String, Object, Boolean],
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
      // {method, target}
      if(_.isPlainObject(action)) {
        Ti.App(this)[action.method](action.target, payload)
      }
      // "method:target"
      else if(_.isString(action)) {
        Ti.App(this).exec(action, payload)
      }
      // Just notify $parent
      else if(action){
        this.$notify(emitName, payload)
      }
    },
    //--------------------------------------------------
    OnFieldChange({name, value}={}) {
      //console.log(" <--- @field:changed", {name, value})
      this.doAction("field:change", this.updateBy, {name, value})
    },
    //--------------------------------------------------
    OnChange(data) {
      //console.log(" <- @changed", data)
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
export default _M;