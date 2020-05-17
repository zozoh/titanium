class TiViewport {
  constructor(){
    this.reset()
  }
  reset($app=null) {
    this.scrolling = []
    this.resizing = []
    return this
  }
  watch(context, {scroll, resize}={}){
    if(_.isFunction(scroll)) {
      this.scrolling.push({
        context, handler: scroll
      })
    }
    if(_.isFunction(resize)) {
      this.resizing.push({
        context, handler: resize
      })
    }
  }
  unwatch(theContext){
    _.remove(this.scrolling, ({context})=>context===theContext)
    _.remove(this.resizing, ({context})=>context===theContext)
  }
  startListening() {
    let vp = this
    // Prevent multiple listening
    if(this.isListening)
      return
    // Do listen: resize
    window.addEventListener("resize", (evt)=>{
      for(let call of vp.resizing) {
        call.handler.apply(call.context, [evt])
      }
    })
    // Do listen: scroll
    window.addEventListener("scroll", (evt)=>{
      for(let call of vp.scrolling) {
        call.handler.apply(call.context, [evt])
      }
    })
    // Mark
    this.isListening = true
  }
}
//-----------------------------------
export const Viewport = new TiViewport()
