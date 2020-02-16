export default {
  ///////////////////////////////////
  inheritAttrs : false,
  ///////////////////////////////////
  data: ()=>({
    naturalWidth  : -1,
    naturalHeight : -1,
    viewportWidth  : -1,
    viewportHeight : -1,
    fitMode  : "contain",
    imgLoading : true,
    inViewport : false
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
        "as-fitmode-cover"   : this.fitMode=="cover",
        "as-fitmode-contain" : this.fitMode=="contain",
        "is-img-loading" : this.imgLoading,
        "is-in-viewport" : this.inViewport
      }, this.className)
    },
    topStyle() {
      return {
        width  : this.width, 
        height : this.height
      }
    },
    theImageStyle() {
      let css = {
        "visibility" : "hidden",
        "position"   : "relative"
      }
      // If ready, then resize to zoom
      if(this.naturalWidth > 0
        && this.naturalHeight > 0) {
        // Get the measure of viewport
        let viewport = Ti.Rects.create({
          top:0, left:0,
          width  : this.viewportWidth,
          height : this.viewportHeight
        })
        // Get the measure of image
        let r_img = Ti.Rects.create({
          top:2, left:2,
          width  : this.naturalWidth,
          height : this.naturalHeight
        })
        // Zoom it
        let r_im2 = r_img.zoomTo({
          width  : viewport.width, 
          height : viewport.height,
          mode   : this.fitMode
        })
        // mark
        this.inViewport = viewport.contains(r_im2, 2)
        // append to css
        css.width  = r_im2.width
        css.height = r_im2.height
        css.left = (viewport.width  - r_im2.width)  / 2
        css.top  = (viewport.height - r_im2.height) / 2
        css.visibility = "visible"
      }
      // done
      return Ti.Css.toStyle(css)
    }
  },
  ///////////////////////////////////
  methods : {
    onImageLoaded() {
      let $img = this.$refs.the_image
      if($img) {
        this.naturalWidth  = $img.naturalWidth
        this.naturalHeight = $img.naturalHeight
        this.imgLoading = false
      }
    },
    onResizeViewport() {
      let r_vpt = Ti.Rects.createBy(this.$refs.con)
      this.viewportWidth  = r_vpt.width
      this.viewportHeight = r_vpt.height
    },
    onToggleImageFitMode() {
      this.fitMode = ({
        "contain" : "cover",
        "cover"   : "contain"
      })[this.fitMode]
    }
  },
  ///////////////////////////////////
  mounted : function(){
    Ti.Viewport.watch(this, {resize : ()=>{
      this.onResizeViewport()
    }})
    this.onResizeViewport()
  },
  ///////////////////////////////////
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
  ///////////////////////////////////
}