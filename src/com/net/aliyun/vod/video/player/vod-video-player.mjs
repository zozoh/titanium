export default {
  ///////////////////////////////////////////////////////
  props : {
    "autoplay": {
      type: Boolean,
      default: true
    },
    "videoId": {
      type: String,
      default: undefined
    },
    "coverURL": {
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
    showPlayer() {
      this.$player = new Aliplayer({
        id: this.PlayerID,
        width: "100%",
        height: "100%",
        autoplay: this.autoplay,
        vid: this.videoId,
        cover: this.coverURL,
        encryptType: this.encryptType,
        playauth : this.playAuth
      })
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  mounted : function() {
    _.delay(()=>this.showPlayer(), 0)
  }
  ///////////////////////////////////////////////////////
}