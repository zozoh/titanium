export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value" : null,
  "dict" : {
    type : [String, Ti.Dict],
    default : undefined
  },
  "valueCase" : {
    type : String,
    default : undefined,
    validator : (cs)=>(Ti.Util.isNil(cs)||Ti.S.isValidCase(cs))
  },
  "trimed" : {
    type : Boolean,
    default : true
  },
  "format" : {
    type : [String, Function],
    default : undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "href" : {
    type : String,
    default : undefined
  },
  "newTab" : {
    type : Boolean,
    default : false
  },
  "editable" : {
    type : Boolean,
    default : false
  },
  "hover" : {
    type : [Array, String],
    default : ()=>["suffixIcon"]
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "placeholder" : {
    type : [String, Number],
    default : "i18n:nil"
  },
  "autoI18n" : {
    type : Boolean,
    default : true
  },
  "prefixIcon" : {
    type : String,
    default : undefined
  },
  "prefixText" : {
    type : String,
    default : undefined
  },
  "suffixText" : {
    type : String,
    default : undefined
  },
  "suffixIcon" : {
    type : String,
    default : undefined
  },
  //-----------------------------------
  // Measure
  //-----------------------------------
  "width" : {
    type : [Number, String],
    default : undefined
  },
  "height" : {
    type : [Number, String],
    default : undefined
  },
  "valueMaxWidth" : {
    type : [Number, String],
    default : undefined
  }
}