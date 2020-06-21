const _M = {
  ///////////////////////////////////////////////////
  props : {
    "index" : {
      type : Number,
      default : -1
    },
    "stepKey" : {
      type : String,
      default : null
    },
    "title" : {
      type : String,
      default : null
    },
    "serializer": {
      type: Function,
      default: null
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