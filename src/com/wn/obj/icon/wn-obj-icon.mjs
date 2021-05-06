/////////////////////////////////////////////////////
export default {
  ///////////////////////////////////////////////////
  props : {
    // icon string
    "icon" : {
      type : String
    },
    // image thumb: id:xxxx
    "thumb" : {
      type : String
    },
    "mime" : {
      type : String
    },
    "type" : {
      type : String
    },
    "race" : {
      type : String
    },
    // higher priority then default Icon and {type,mime,race}
    "candidateIcon" : {
      type : String
    },
    // default icon string
    "defaultIcon" : {
      type : String,
      default : "fas-cube"
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
      if(/^https?:\/\//.test(this.thumb)) {
        return  {
          type : "image",
          value : this.thumb
        }
      }
      return Wn.Util.getObjThumbIcon({
        candidateIcon : this.candidateIcon,
        timestamp : this.timestamp,
        thumb : this.thumb,
        icon  : this.icon,
        mime  : this.mime,
        type  : this.type,
        race  : this.race,
      }, this.defaultIcon)
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