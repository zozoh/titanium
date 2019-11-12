const resize = function(evt){
  this.doResizeVideo()
}
//-----------------------------------
export default {
  inheritAttrs : false,
  data: ()=>({
    naturalWidth  : -1,
    naturalHeight : -1,
    fitMode  : "none",
    loading : true
  }),
  props : {
    "src" : {
      type : String,
      default : null
    },
    "width" : {
      type : [String, Number],
      default : ""
    },
    "height" : {
      type : [String, Number],
      default : ""
    }
  },
  computed : {
    topClass() {
      return {
        "as-none"    : this.fitMode=="none",
        "as-contain" : this.fitMode=="contain",
        "as-loading" : this.loading
      }
    },
    topStyle() {
      return {
        width  : this.width, 
        height : this.height
      }
    }
  },
  methods : {
    onVideoLoaded() {
      let $video = this.$refs.the_video
      this.naturalWidth  = $video.videoWidth
      this.naturalHeight = $video.videoHeight
      //console.log(this.naturalWidth, this.naturalHeight)
      this.loading = false
      //$video.volume = 1
      this.doResizeVideo()
    },
    isContainsByViewport() {
      // Get the viewport
      let vpRect = Ti.Rects.createBy(this.$el)
      let imRect = Ti.Rects.create({
        ...vpRect.raw("tl"),
        width  : this.naturalWidth,
        height : this.naturalHeight
      })
      // console.log("vpRect", vpRect.toString())
      // console.log("imRect", imRect.toString())
      return vpRect.contains(imRect)
    },
    doResizeVideo() {
      // Image is in viewport
      if(this.isContainsByViewport()) {
        this.fitMode = "none"
      }
      // Image is too big, mark "cover"
      else {
        this.fitMode = "contain"
      }
    },
  },
  mounted : function(){
    Ti.Viewport.watch(this, {resize})
  },
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
}