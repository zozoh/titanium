export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value": {
    type: Object,
    default: undefined
  },
  "group" : {
    type : Boolean,
    default : true
  },
  "fields" : {
    type : Object,
    default : ()=>({})
  },
  "onlyFields" : {
    type: Boolean,
    default: true
  },
  // merge each time data change
  "fixed": {
    type: Object,
    default: undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "defaultComType" : {
    type : String,
    default : "ti-input"
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "spacing" : {
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
  }
}