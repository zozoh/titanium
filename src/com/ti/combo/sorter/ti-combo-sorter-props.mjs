const _M = {
  "placeholder" : {
    type : String,
    default : "i18n:no-title"
  },
  "options" : {
    type : Array,
    default : ()=>[]
  },
  /*
  {
    "CreateTime": 1  // 1:ASC, -1:DESC
  }
  */
  "value" : {
    type : Object,
    default : null
  },
  "width": {
    type : [Number, String],
    default : undefined
  },
  "height": {
    type : [Number, String],
    default : undefined
  },
  "dropWidth" : {
    type : [Number, String],
    default : "box"
  },
  "dropHeight" : {
    type : [Number, String],
    default : null
  },
  "sortIcons" : {
    type : Object,
    default : ()=>({
      asc  : "fas-long-arrow-alt-up",
      desc : "fas-long-arrow-alt-down"
    })
  },
  "suffixIcon" : {
    type : String,
    default : "im-menu-list"
  },
}
export default _M;