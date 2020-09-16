const _M = {
  /////////////////////////////////////////
  props : {
    "title" : {
      type : String,
      default : undefined
    },
    "brief" : {
      type : String,
      default : undefined
    },
    "pubDate" : {
      type : [String, Number, Date],
      default : undefined
    },
    "tags" : {
      type : [String, Array],
      default : undefined
    },
    "dateFormat" : {
      type : String,
      default : "yyyy-MM-dd"
    },
    "author" : {
      type : String,
      default : undefined
    },
    "duration" : {
      type : [String, Number],
      default : undefined
    },
    "watchCount" : {
      type : Number,
      default : 0
    },
    "align": {
      type: String,
      default: "center",
      validator: v => /^(left|center|right)$/.test(v)
    },
    "bottomLine" : {
      type : Boolean,
      default : true
    }
  },
  //////////////////////////////////////////
  computed : {
    //......................................
    TopClass(){
      return this.getTopClass(`align-${this.align}`)
    },
    //......................................
    TheTags() {
      return Ti.S.toArray(this.tags)
    },
    //......................................
    hasTags() {
      return !_.isEmpty(this.TheTags)
    },
    //......................................
    DurationText() {
      if(_.isNumber(this.duration)) {
        return Ti.I18n.getf("du-in-min", {n:this.duration})
      }
      return this.duration
    },
    //......................................
    PubDateText() {
      if(this.pubDate) {
        return Ti.DateTime.format(this.pubDate, this.dateFormat)
      }
    },
    //......................................
    hasInfo() {
      return this.author
        || this.watchCount > 0
        || this.author
        || this.duration
    }
    //......................................
  }
  //////////////////////////////////////////
}
export default _M;