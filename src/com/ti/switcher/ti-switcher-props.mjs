export default {
  //-----------------------------------
  // Data
  //-----------------------------------
  "value" : null,
  "options" : {
    type : [Array, Function, String, Ti.Dict],
    default : ()=>[]
  },
  "valueBy" : {
    type : [String, Function],
    default : undefined
  },
  "textBy" : {
    type : [String, Function],
    default : undefined
  },
  "iconeBy" : {
    type : [String, Function],
    default : undefined
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "multi" : false,
  // In single mode, to keep at least one item selected,
  // you can set the prop to `false`
  "allowEmpty" : {
    type : Boolean,
    default : true
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "defaultIcon" : {
    type : String,
    default : null
  },
  "emptylAs" : {
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