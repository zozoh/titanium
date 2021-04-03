const _M = {
  //...............................................
  // Data
  //...............................................
  "value" : {
    type : String,
    default : undefined
  },
  //...............................................
  // Behavior
  //...............................................
  "mode" : {
    type : String,
    default : "javascript"
  },
  //...............................................
  // Aspact
  //...............................................
  "theme" : {
    type : String,
    default : "monokai"
  },
  "options" : {
    type : Object
  },
  "loadingAs" : {
    type : Object,
    default : ()=>({
      className : "as-nil-mask as-big-mask",
      icon : undefined,
      text : undefined
    })
  }
}
export default _M;