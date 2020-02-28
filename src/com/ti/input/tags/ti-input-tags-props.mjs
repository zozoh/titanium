export default {
  //-----------------------------------
  // Data
  //-----------------------------------
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
  "tagOptions" : {
    type : [Array, Function],
    default : ()=>[]
  },
  //-----------------------------------
  // Behavior
  //-----------------------------------
  "canInput" : {
    type : Boolean,
    default : true
  },
  "cancelTagBubble" : {
    type : Boolean,
    default : false
  },
  //-----------------------------------
  // Aspect
  //-----------------------------------
  "tagIcon" : {
    type : String,
    default : null
  }
}