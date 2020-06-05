const _M = {
  //...............................................
  // Data
  //...............................................
  "mediaBase" : {
    type : String,
    default : undefined
  },
  "value" : {
    type : String,
    default : ""
  }, 
  //...............................................
  // Behavior
  //...............................................
  // Ext-toolbar item defination
  "actions": {
    type: Object,
    default: ()=>({})
  },
  // preview -> markdown -> save
  "markdownMediaSrc": {
    type: [String, Function],
    default: undefined
  },
  // load -> markdown -> preview
  "previewMediaSrc": {
    type: [String, Function],
    default: undefined
  },
  //...............................................
  // Aspact
  //...............................................
  "placeholder" : {
    type : String,
    default : "i18n:blank"
  },
  "theme" : {
    type : String,
    default : "nice"
  },
  "toolbar" : {
    type : Array,
    default : ()=>[
      "Heading", "|", "B", "I", "|", "Link", "Code", 
      "|", "BlockQuote", "CodeBlock", 
      "|", "Outdent", "Indent",  
      "|", "UL", "OL"
      ]
  },
  "toolbarAlign" : {
    type : String,
    default: "left",
    validator : v => /^(left|right|center)$/.test(v)
  },
  "blankAs" : {
    type : Object,
    default : ()=>({
      icon : "fas-coffee",
      text : null
    })
  }
}
export default _M;