const _M = {
  //////////////////////////////////////////
  data : ()=>({
    myCurrentIndex: 0
  }),
  //////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "data" : {
      type : Array,
      default : ()=>[]
    },
    "audioItem" : {
      type : Object,
      default : ()=>({
        title : "=title"
      })
    },
    "preview" : {
      type: Object
    },
    "mime": {
      type : [String, Function],
      default : "=mime"
    },
    "type" : {
      type : [String, Function],
      default : "=type"
    },
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "audioConf" : {
      type : Object
    },
    "youtubeConf" : {
      type : Object
    }
  },
  //////////////////////////////////////////
  computed : {
    //--------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //--------------------------------------
    CurrentAudioData() {
      return _.nth(this.data, this.myCurrentIndex)
    },
    //--------------------------------------
    CurrentAudioMime() {
      return this.getItemValueBy(this.CurrentAudioData, this.mime)
    },
    //--------------------------------------
    CurrentAudioType() {
      return this.getItemValueBy(this.CurrentAudioData, this.type)
    },
    //--------------------------------------
    CurrentAudioCom() {
      // Youtube Audio
      if("youtube" == this.CurrentAudioType) {
        return {
          comType : "NetYoutubePlayer",
          comConf : _.assign({}, this.youtubeConf, {
            value : {
              id : this.CurrentAudioData.yt_video_id,
              thumbUrl : this.CurrentAudioData.thumb
            }
          })
        }
      }
      // Normal audio
      else {
        let src = Ti.WWW.evalObjPreviewSrc(this.CurrentAudioData, this.preview)
        return {
          comType : "TiMediaAudio",
          comConf :_.assign({}, this.audioConf, {
            src
          })
        }
      }
    },
    //--------------------------------------
    hasAudios() {
      return !_.isEmpty(this.data)
    },
    //--------------------------------------
    hasMultiAudios() {
      return this.hasAudios && this.data.length > 1
    },
    //--------------------------------------
    AudioItems() {
      return _.map(this.data, (it, index) => {
        let re = Ti.Util.explainObj(it, this.audioItem) || {}
        if(!re.title) {
          re.title = index + 1;
        }
        re.current = index == this.myCurrentIndex
        re.className = {
          "is-current" : re.current
        }
        re.index = index
        return re
      })
    }
    //--------------------------------------
  },
  //////////////////////////////////////////
  methods : {
    //--------------------------------------
    OnGoTo({index}) {
      this.myCurrentIndex = index
    },
    //--------------------------------------
    getItemValueBy(item={}, key) {
      // Customized
      if(_.isFunction(key)) {
        return key(item)
      }
      // Explain
      if(item) {
        if(_.isString(item)) {
          return key
        }
        return Ti.Util.explainObj(item, key)
      }
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;