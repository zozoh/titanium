export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value" : null,
  "dict" : {
    type : String,
    default : null
  },
  "trimed" : {
    type : Boolean,
    default : true
  },
  "format" : undefined,
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "href" : {
    type : String,
    default : null
  },
  "newTab" : {
    type : Boolean,
    default : false
  },
  "breakLine" : {
    type : Boolean,
    default : true
  },
  "editable" : {
    type : Boolean,
    default : false
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "blankAs" : {
    type : String,
    default : "i18n:nil"
  },
  "autoI18n" : {
    type : Boolean,
    default : true
  },
  "prefixIcon" : {
    type : String,
    default : null
  },
  "prefixText" : {
    type : String,
    default : null
  },
  "suffixText" : {
    type : String,
    default : null
  },
  "suffixIcon" : {
    type : String,
    default : null
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "width" : {
    type : [Number, String],
    default : null
  },
  "height" : {
    type : [Number, String],
    default : null
  }
}