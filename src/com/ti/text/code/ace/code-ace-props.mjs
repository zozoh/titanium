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
    default : "auto"
    //default : "monokai"
  },
  "options" : {
    type : Object,
    default: ()=>({
      fontFamily: "Consolas, 'Courier New', monospace",
      lineHeight: "1.5em",
      fontSize: "14px"
    })
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