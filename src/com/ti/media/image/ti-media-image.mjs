const resize = function(evt){
  this.doResizeImage()
}
/////////////////////////////////////
export default {
  ///////////////////////////////////
  inheritAttrs : false,
  ///////////////////////////////////
  data: ()=>({
    naturalWidth  : -1,
    naturalHeight : -1,
    fitMode  : "none",
    imgLoading : true
  }),
  ///////////////////////////////////
  props : {
    "className" : null,
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
  ///////////////////////////////////
  computed : {
    topClass() {
      return Ti.Css.mergeClassName({
        "as-fitmode-none"    : this.fitMode=="none",
        "as-fitmode-cover"   : this.fitMode=="cover",
        "as-fitmode-contain" : this.fitMode=="contain",
        "is-img-loading" : this.imgLoading
      }, this.className)
    },
    topStyle() {
      return {
        width  : this.width, 
        height : this.height
      }
    }
  },
  ///////////////////////////////////
  methods : {
    onImageLoaded() {
      let $img = this.$refs.the_image
      if($img) {
        this.naturalWidth  = $img.naturalWidth
        this.naturalHeight = $img.naturalHeight
        this.doResizeImage()
        this.imgLoading = false
      }
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
    doResizeImage() {
      //console.log("I am doResize")
      // Image is in viewport
      if(this.isContainsByViewport()) {
        this.fitMode = "none"
      }
      // Image is too big, mark "cover"
      else {
        this.fitMode = "contain"
      }
    },
    onToggleImageFitMode() {
      if(this.isContainsByViewport()) {
        this.fitMode = ({
          "none"  : "cover",
          "cover" : "none"
        })[this.fitMode]
      } else {
        this.fitMode = ({
          "contain" : "cover",
          "cover"   : "contain"
        })[this.fitMode]
      }
    }
  },
  ///////////////////////////////////
  mounted : function(){
    Ti.Viewport.watch(this, {resize})
  },
  ///////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////
}