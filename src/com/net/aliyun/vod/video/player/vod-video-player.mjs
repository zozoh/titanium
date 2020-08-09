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

        this.$player = new Aliplayer({
          id: this.PlayerID,
          width: "100%",
          height: "100%",
          autoplay: this.autoplay,
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
  mounted: function(){
    this.initPlayer();
  }
  ///////////////////////////////////////////////////////
}