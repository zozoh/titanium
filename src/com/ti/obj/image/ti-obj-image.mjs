const resize = function(evt){
  this.doResizeImage()
}
//-----------------------------------
export default {
  data: ()=>({
    naturalWidth  : -1,
    naturalHeight : -1
  }),
  props : {
    "src" : {
      type : String,
      default : null
    }
  },
  computed : {
    
  },
  methods : {
    onImageLoaded() {
      let $img = this.$refs.the_image
      this.naturalWidth  = $img.naturalWidth
      this.naturalHeight = $img.naturalHeight
    },
    doResizeImage() {
      console.log("I am resize image")
    }
  },
  mounted : function(){
    Ti.Viewport.watch(this, {resize})
  },
  beforeDestroy : function(){
    Ti.Viewport.unwatch(this)
  }
}