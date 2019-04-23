export default {
  props : {
    "meta" : {
      type : Object,
      default : ()=>({})
    },
    "data" : {
      type : Object,
      default : null
    },
    "status" : {
      type : Object,
      default : ()=>({
        "changed"   : false,
        "saving"    : false,
        "reloading" : false
      })
    }
  },
  computed : {
    
  },
  methods : {
    
  }
}