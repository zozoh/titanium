export default {
//-----------------------------------
  // Data
  //-----------------------------------
  //-----------------------------------
  // Behavior
  //-----------------------------------
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "canInput" : {
    type : Boolean,
    default : true
  },
  "value" : null,
  "inputing" : {
    type : String,
    default : null
  },
  "valueCase" : {
    type : String,
    default : null,
    validator : (cs)=>(Ti.Util.isNil(cs)||Ti.S.isValidCase(cs))
  },
  "placeholder" : {
    type : [String, Number],
    default : null
  },
  "trimed" : {
    type : Boolean,
    default : true
  },
  "hideBorder" : {
    type : Boolean,
    default : false
  },
  // +1 from the begin
  // -1 from the last
  "maxValueLen" : {
    type : Number,
    default : 0
  },
  "valueUnique" : {
    type : Boolean,
    default : true
  },
  // the whole top-box width
  "width" : {
    type : [Number, String],
    default : null
  },
  "inputWidth" : {
    type : [Number, String],
    default : null
  },
  "inputHeight" : {
    type : [Number, String],
    default : null
  },
  // If true, blur->changed willl be auto-apply as changed
  "changedKeyName" : {
    type : String,
    default : "ENTER"
  },
  "clickToFocus" : {
    type : Boolean,
    default : false
  },
  "tagIcon" : {
    type : String,
    default : null
  },
  "tagOptions" : {
    type : [Array, Function],
    default : ()=>[]
  },
  "cancelTagBubble" : {
    type : Boolean,
    default : false
  },
  "prefixHoverIcon" : {
    type : String,
    default : "zmdi-close-circle"
  },
  "prefixIcon" : {
    type : String,
    default : null
  },
  "prefixIconForClean" : {
    type : Boolean,
    default : true
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
  "focus" : {
    type : Boolean,
    default : false
  },
  "hover" : {
    type : [Array, String],
    default : ()=>["prefixIcon", "suffixIcon"]
  },
}