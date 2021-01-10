export default {
  "fuse" : {
    type : Object,
    default : ()=>({
      key  : "wn-obj-form",
      noti : undefined
    })
  },
  // {method : "dispatch", target : "main/onChanged"}
  "setDataBy" : {
    type : [String, Object, Boolean],
    default : undefined
  },
  // {method : "dispatch", target : "main/changeMeta"}
  "updateBy" : {
    type : [String, Object, Boolean],
    default : undefined
  },
  // {method : "commit", target : "main/setFieldStatus"}
  "setFieldStatusBy" : {
    type : [String, Object, Boolean],
    default : undefined
  },
  // Load fields setting 
  "fields" : {
    type : [String, Array, Function],
    default : ()=>[]
  },
  // Load fields setting 
  "data" : {
    type : [String, Object],
    default : undefined
  }
}