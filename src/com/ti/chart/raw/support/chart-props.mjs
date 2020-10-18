export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "data" : {
    type : Array,
    default : ()=>[]
  },
  "nameBy" : {
    type : String,
    default : "name"
  },
  "valueBy" : {
    type : String,
    default : "value"
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "padding" : {
    type : [Number, Array, String],
    default : "auto"
  },
  "appendPadding" : {
    type : [Number, Array, String],
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
  }
}