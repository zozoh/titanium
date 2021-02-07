export default {
  ///////////////////////////////////////////////////////
  data : ()=>({
    $audio : undefined,

    dragging : false,
    loading  : false,
    seeking  : false,
    stalled  : false,
    canplay  : false,
    playing  : false,

    // Media internal status
    bufferedBegin : undefined,
    bufferedEnd : undefined,
    muted : undefined,
    paused : undefined,
    ended : undefined,
    volume : undefined,
    duration : undefined,   // In sec.
    currentTime : 0,        // In sec.
  }),
  ///////////////////////////////////////////////////////
  props : {
    //-----------------------------------
    // Data
    //-----------------------------------
    "src" : {
      type : String,
      default : null
    },
    //-----------------------------------
    // Measure
    //-----------------------------------
    "timelineWidth" : {
      type : [Number, String],
      default : "100%"
    },
    "barHeight" : {
      type : [Number, String],
      default : undefined
    },
    "conWidth" : {
      type : [Number, String],
      default : undefined
    },
    "conHeight" : {
      type : [Number, String],
      default : undefined
    },
    "width" : {
      type : [Number, String],
      default : undefined
    },
    "height" : {
      type : [Number, String],
      default : undefined
    }
  },
  ///////////////////////////////////////////////////////
  computed : {
    //---------------------------------------------------
    TopClass() {
      return this.getTopClass()
    },
    //---------------------------------------------------
    TopStyle() {
      return Ti.Css.toStyle({
        width  : this.width, 
        height : this.height
      })
    },
    //---------------------------------------------------
    ControlClass() {
      return {
        "is-ready"    : this.canplay,
        "is-playing"  : this.playing,
        "is-paused"   : this.paused,
        "is-ended"    : this.ended
      }
    },
    //---------------------------------------------------
    ControlStyle() {
      return Ti.Css.toStyle({
        width  : this.conWidth, 
        height : this.conHeight
      })
    },
    //---------------------------------------------------
    PlayIcon() {
      if(this.loading || this.seeking) {
        return "fas-spinner fa-spin"
      }
      if(this.paused) {
        return "zmdi-play"
      }
      return "zmdi-pause"
    },
    //---------------------------------------------------
    VolumeIcon() {
      if(this.muted) {
        return "zmdi-volume-off"
      }
      if(!this.volume) {
        return "zmdi-volume-mute"  
      }
      if(this.volume < 0.5) {
        return "zmdi-volume-down"
      }
      return "zmdi-volume-up"
    },
    //---------------------------------------------------
    TimeTextWidth() {
      if(this.duration > 3600) {
        return "8em"
      }
      return "5em"
    },
    //---------------------------------------------------
    TimelineConfig() {
      return {
        precision : -1,
        width     : this.timelineWidth,
        barHeight : this.barHeight,
        format    : (v)=>{
          let tm = Ti.DateTime.parseTime(v, {unit:"s"})
          return tm.toString("min")
        },
        textWidth : this.TimeTextWidth
      }
    },
    //---------------------------------------------------
    VolumeConfig() {
      return {
        precision : -1,
        notifyFrequency : 100,
        height : "unset"
      }
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  methods : {
    //---------------------------------------------------
    OnTimelineChange(val) {
      // console.log("timline", val)
      this.$audio.currentTime = val
    },
    //---------------------------------------------------
    OnTimelineDragBegin() {
      this.dragging = true
    },
    OnTimelineDragEnd() {
      this.dragging = false
    },
    //---------------------------------------------------
    OnVolumeBarChange(val) {
      // console.log("volume", val)
      this.$audio.volume = val
    },
    //---------------------------------------------------
    /*
    Load:
      1. OnLoadsStart
      2. OnDurationChange
      3. OnLoadedMetaData
      4. OnLoadedData
      5. OnCanPlay
    
    Play
      1. OnPlay
      2. OnPause
      3. OnEnded

    Seek:
      1. OnSeeking
      2. OnSeeked
      3. OnCanPlay
    
    Volume
      1. OnVolumeChange
    */
    //---------------------------------------------------
    OnLoadsStart() {
      // console.log("OnLoadsStart")
      this.loading = true
      this.updateMediaState()
    },
    //---------------------------------------------------
    OnLoadedMetaData() {
      // console.log("OnLoadedMetaData")
    },
    //---------------------------------------------------
    OnDurationChange() {
      // console.log("OnDurationChange", this.$audio.duration)
      this.updateMediaState()
    },
    //---------------------------------------------------
    OnLoadedData() {
      // console.log("OnLoadedData")
      this.loading = false
      this.updateMediaState()
    },
    //---------------------------------------------------
    OnSeeking() {
      // console.log("OnSeeking")
      this.seeking = true
      this.updateMediaState()
    },
    //---------------------------------------------------
    OnSeeked() {
      // console.log("OnSeeked")
      this.seeking = false
      this.updateMediaState()
    },
    //---------------------------------------------------
    OnCanPlay() {
      // console.log("OnCanPlay")
      this.loading = false
      this.canplay = true
      this.updateMediaState()
    },
    //---------------------------------------------------
    OnPlay() {
      // console.log("OnPlay")
      this.playing = true
      this.updateMediaState()
    },
    //---------------------------------------------------
    OnPause() {
      // console.log("OnPause")
      this.playing = false
      this.updateMediaState()
    },
    //---------------------------------------------------
    OnEnded() {
      // console.log("OnEnded")
      this.playing = false
      this.updateMediaState()
    },
    //---------------------------------------------------
    OnTimeUpdate() {
      if(!this.dragging) {
        //console.log("OnTimeUpdate")
        this.currentTime = this.$audio.currentTime
        this.updateMediaBuffered()
      }
    },
    //---------------------------------------------------
    OnVolumeChange() {
      //console.log("OnVolumeChange", this.$audio.volume, this.$audio.muted)
      this.volume = this.$audio.volume
      this.muted = this.$audio.muted
    },
    //---------------------------------------------------
    OnWaiting() {
      // console.log("OnWaiting")
      this.loading = true
    },
    //---------------------------------------------------
    OnStalled() {
      // console.log("OnWaiting")
      this.stalled = true
    },
    //---------------------------------------------------
    updateMediaBuffered() {
      let buf = this.$audio.buffered
      if(buf.length >= 1) {
        this.bufferedBegin = this.$audio.buffered.start(0)
        this.bufferedEnd   = this.$audio.buffered.end(0)
      } else {
        this.bufferedBegin = undefined
        this.bufferedEnd   = undefined
      }
    },
    //---------------------------------------------------
    updateMediaState() {
      this.updateMediaBuffered()
      this.paused      = this.$audio.paused
      this.ended       = this.$audio.ended
      this.volume      = this.$audio.volume
      this.muted       = this.$audio.muted
      this.duration    = this.$audio.duration
      this.currentTime = this.$audio.currentTime
    },
    //---------------------------------------------------
    togglePlay() {
      if(this.canplay) {
        if(this.paused) {
          this.$audio.play()
        } else {
          this.$audio.pause()
        }
      }
    },
    //---------------------------------------------------
    toggleMuted() {
      this.$audio.muted = !this.muted
    }
    //---------------------------------------------------
  },
  ///////////////////////////////////////////////////////
  mounted : function() {
    this.$audio = this.$refs.audio
  }
  ///////////////////////////////////////////////////////
}