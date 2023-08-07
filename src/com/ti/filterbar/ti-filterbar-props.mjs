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
   [{
      // If without declare, take it as default case
      // If RegExp, it will update match group $0,$1...
      // Then the key/val can get the render context
      // {test:'^(name)=(.+)', key:"${1}", val:"${2}"}
      // Else, the match group only has the `${0}` as input value
      test  : AutoMatch | RegExp,
      match : "^xxx",
      key:"${1}", 
      val:"${2}", 
      type:"Integer", 
      mode:"=="
    },
    {
      key:"id"
    }
  ]
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
  "majors": {
    type: [Object, Array],
    default: () => []
  },
  "topMajors": {
    type: [Object, Array, String, Boolean],
    default: false
  },
  /*
   How to show the filter data as readable tags
   {xyz: Function|Explain|Dict}
  */
  "filterTags": {
    type: Object,
    default: () => ({})
  },
  "filterTagItemMaxWidth": {
    type: [String, Number],
    default: "2rem"
  },
  /* 
  Advance search dialog form. If declared, show the [Suffix Icon]
  */
  "advanceForm": {
    type: Object,
    default: undefined
  },
  // The dependance components which the advanceForm relay on
  "advanceComponents": {
    type: [String, Array]
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
    default: undefined
  },
  "prefixIcon": {
    type: String,
    default: "im-filter"
  },
  "suffixIcon": {
    type: String,
    default: "fas-bars"
  }
  //-----------------------------------
  // Measure
  //-----------------------------------
};
