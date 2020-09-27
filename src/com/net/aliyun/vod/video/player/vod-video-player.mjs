/*
Aliyun Player JS SDK properties and API:
https://help.aliyun.com/document_detail/125572.html?spm=a2c4g.11186623.6.1101.19dc1c4cAXr5Cs

Aliyun VOD get play address api:
https://help.aliyun.com/document_detail/56124.html?spm=a2c4g.11186623.2.31.6c797fbfuEVYDi
*/
export default {
  ///////////////////////////////////////////////////////
  props : {
    "autoplay": {
      type: Boolean,
      default: false
    },
    "videoId": {
      type: String,
      default: undefined
    },
    "coverUrl": {
      type: String,
      default: undefined
    },
    "playAuth": {
      type: String,
      default: undefined
    },
    "encryptType": {
      type: Number,
      default: undefined
    },
    "lang" : {
      type : String,
      default: undefined
    },
    "format" : {
      type : String,
      default: "m3u8"
    },
    "definition" : {
      type : String,
      default: "FD,LD,SD,HD,OD,2K,4K"
    },
    "defaultDefinition" : {
      type : String,
      default: "FD"
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass();
    },
    //---------------------------------------------------
    PlayerID() {
      let n = parseInt(Math.random()* 100000);
      return `ALIPLAYER_${n}`
    },
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods :{
    //---------------------------------------------------
    initPlayer() {
      if(!this.$player
        && this.playAuth
        && this.videoId
        && this.coverUrl) {

        // console.log("haha", {
        //   playAuth: this.playAuth,
        //   videoId: this.videoId,
        //   coverUrl: this.coverUrl
        // })

        let lang = this.lang || Ti.Config.lang()

        this.$player = new Aliplayer({
          id: this.PlayerID,
          width: "100%",
          height: "100%",
          autoplay: this.autoplay,
          useH5Prism: true,
          format : this.format,
          definition : this.definition,
          defaultDefinition: this.defaultDefinition,
          language: lang,
          vid: this.videoId,
          cover: this.coverUrl,
          encryptType: this.encryptType,
          playauth : this.playAuth
        })
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  watch: {
    // "playAuth": function() {
    //   this.$nextTick(()=>this.initPlayer())
    // },
    // "videoId": function() {
    //   this.$nextTick(()=>this.initPlayer())
    // },
    // "coverUrl": function() {
    //   this.$nextTick(()=>this.initPlayer())
    // }
  },
  ///////////////////////////////////////////////////////
  mounted(){
    this.initPlayer();
  },
  ///////////////////////////////////////////////////////
  beforeDestroy() {
    if(this.$player) {
      this.$player.dispose();
    }
  }
  ///////////////////////////////////////////////////////
}