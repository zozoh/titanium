class TiViewport {
  constructor() {
    this.reset()
  }
  reset($app = null) {
    this.scrolling = []
    this.resizing = []
    return this
  }
  watch(context, { scroll, resize } = {}) {
    if (_.isFunction(scroll)) {
      this.scrolling.push({
        context, handler: scroll
      })
    }
    if (_.isFunction(resize)) {
      this.resizing.push({
        context, handler: resize
      })
    }
  }
  unwatch(theContext) {
    _.remove(this.scrolling, ({ context }) => context === theContext)
    _.remove(this.resizing, ({ context }) => context === theContext)
  }
  notifyResize(evt = {}) {
    _.delay(() => {
      this.resize(evt)
    })
  }
  notifyScroll(evt = {}) {
    _.delay(() => {
      this.scroll(evt)
    })
  }
  resize(evt = {}) {
    for (let call of this.resizing) {
      call.handler.apply(call.context, [evt])
    }
  }
  scroll(evt = {}) {
    Ti.Toptip.destroy()
    for (let call of this.scrolling) {
      call.handler.apply(call.context, [evt])
    }
  }
  startListening() {
    let vp = this
    // Prevent multiple listening
    if (this.isListening)
      return
    // Do listen: resize
    window.addEventListener("resize", (evt) => {
      vp.resize()
    })
    // Do listen: scroll
    window.addEventListener("scroll", (evt) => {
      vp.scroll()
    })
    // Mark
    this.isListening = true
  }
}
//-----------------------------------
export const Viewport = new TiViewport()
