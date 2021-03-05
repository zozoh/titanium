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
    //-----------------------------------
    // Aspect
    //-----------------------------------
    "audioConf" : {
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
    CurrentAudioSrc() {
      return Ti.WWW.evalObjPreviewSrc(this.CurrentAudioData, this.preview)
    },
    //--------------------------------------
    CurrentAudioComConf() {
      if(this.CurrentAudioSrc) {
        return _.assign({}, this.audioConf, {
          src: this.CurrentAudioSrc
        })
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
    }
    //--------------------------------------
  }
  //////////////////////////////////////////
}
export default _M;