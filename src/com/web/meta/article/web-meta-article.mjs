const _M = {
  /////////////////////////////////////////
  props : {
    "title" : {
      type : String,
      default : null
    },
    "brief" : {
      type : String,
      default : null
    },
    "pubDate" : {
      type : [String, Number, Date],
      default : null
    },
    "tags" : {
      type : [String, Array],
      default : null
    },
    "dateFormat" : {
      type : String,
      default : "yyyy-MM-dd"
    },
    "author" : {
      type : String,
      default : null
    },
    "duration" : {
      type : [String, Number],
      default : null
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