const _M = {
  //////////////////////////////////////////////////////
  data : ()=>({
    myFields : []
  }),
  //////////////////////////////////////////////////////
  computed : {
    //--------------------------------------------------
    isAutoShowBlank() {
      return Ti.Util.fallback(this.autoShowBlank, true)
    },
    //--------------------------------------------------
    FormData() {
      if(_.isString(this.data)) {
        try{
          return JSON.parse(this.data)
        }catch(E){
          return {}
        }
      }
      return this.data
    }
    //--------------------------------------------------
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
      console.log(" <--- @field:changed", {name, value})
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
    },
    //--------------------------------------------------
    async evalMyFields() {
      if(_.isArray(this.fields)) {
        this.myFields = this.fields
      }
      // Dynamic call
      else if(_.isFunction(this.fields)) {
        this.myFields = await this.fields()
      }
      // Load from server side
      else if(_.isString(this.fields)) {
        let o = await Wn.Io.loadMeta(this.fields)
        if(null!=o) {
          this.myFields = await Wn.Io.loadContent(o,  {as:"json"})
        } else {
          this.myFields = []
        }
      }
    }
    //--------------------------------------------------
  },
  //////////////////////////////////////////////////////
  watch : {
    "fields" : {
      handler : "evalMyFields",
      immediate : true
    }
  }
  //////////////////////////////////////////////////////
}
export default _M;