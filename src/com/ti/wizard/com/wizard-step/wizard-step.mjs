const _M = {
  ///////////////////////////////////////////////////
  props : {
    "index" : {
      type : Number,
      default : -1
    },
    "stepKey" : {
      type : String,
      default : undefined
    },
    "dataKey" : {
      type : String,
      default : undefined
    },
    "title" : {
      type : String,
      default : undefined
    },
    "serializer": {
      type: Function,
      default: undefined
    },
    "comType" : {
      type : String,
      default : "ti-label"
    },
    "comConf" : {
      type : Object,
      default : ()=>({})
    }
  },
  ///////////////////////////////////////////////////
  methods : {
    //----------------------------------------------
    OnChange(payload) {
      if(_.isFunction(this.serializer)) {
        payload = this.serializer(payload)
      }
      if(this.dataKey) {
        payload = _.set({}, this.dataKey, payload)
      }
      console.log(payload)
      this.$emit("data:change", payload)
    }
    //----------------------------------------------
  },
  ///////////////////////////////////////////////////
  watch : {
    "title": {
      handler: function(){
        this.$notify("change:title", this.title)
      },
      immediate: true
    }
  }
  ///////////////////////////////////////////////////
}
export default _M;