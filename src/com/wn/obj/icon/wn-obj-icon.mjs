/////////////////////////////////////////////////////
export default {
  inheritAttrs : false,
  ///////////////////////////////////////////////////
  props : {
    // icon string
    "icon" : {
      type : String,
      default : null
    },
    // image thumb: id:xxxx
    "thumb" : {
      type : String,
      default : null
    },
    "mime" : {
      type : String,
      default : null
    },
    "type" : {
      type : String,
      default : null
    },
    "race" : {
      type : String,
      default : null
    },
    // default icon string
    "candidateIcon" : {
      type : String,
      default : null
    },
    // timestamp
    "timestamp" : {
      type : Number,
      default : 0
    }
  },
  ///////////////////////////////////////////////////
  computed : {
    //-----------------------------------------------
    topClass() {
      return Ti.Css.mergeClassName(this.className)
    },
    //-----------------------------------------------
    theIcon() {
      return Wn.Util.getObjThumbIcon({
        candidateIcon : this.candidateIcon,
        timestamp : this.timestamp,
        thumb : this.thumb,
        icon  : this.icon,
        mime  : this.mime,
        type  : this.type,
        race  : this.race,
      }, "fas-cube")
    }
    //-----------------------------------------------
  },
  ///////////////////////////////////////////////////
  methods : {
    //-----------------------------------------------
    //-----------------------------------------------
  }
  ///////////////////////////////////////////////////
}