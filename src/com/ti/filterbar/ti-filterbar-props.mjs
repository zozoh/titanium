export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  /* {a:100, b:99 ...} */
  "filter": {
    type: Object
  },
  /* {ct:-1} */
  "sorter": {
    type: Object
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  /*
   Test the input keyword, auto get the filter key
   [{test:"^(cate):(.+)$", key:"${1}", val:"${2}", type:"Integer", mode:"=="}, {key:"id"}]
   [mode]
     == : Actually equal
     ~= : Ends with: "^.*xxx$"
     =~ : Starts with: "^xxx"
     ~~ : Contains: "^.*xxx"
  */
  "matchKeywords": {
    type: Array,
    default: () => []
  },
  /*
   Major filter items:
   {key:"abc", placeholder:"xxx", options:"#xxx", width:200}
  */
  "marjors": {
    type: [Object, Array],
    default: () => []
  },
  /*
   How to show the filter data as readable tags
   {xyz: Function|Template|Dict}
  */
  "filterTags": {
    type: Object,
    default: () => ({})
  },
  /* 
  Advance search dialog form. If declared, show the [Suffix Icon]
  */
  "advanceForm": {
    type: Object,
    default: undefined
  },
  "sorterConf": {
    type: Object,
    default: undefined
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "placeholder": {
    type: [String, Number],
    default: "i18n:nil"
  },
  // Advance search dialog setting
  "dialog": {
    type: Object,
    default: false
  },
  "prefixIcon": {
    type: String,
    default: "im-filter"
  },
  "suffixIcon": {
    type: String,
    default: "fas-cog"
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
}