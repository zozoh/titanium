///////////////////////////////////////////////////
function CreateHandler($body, name) {
  return Ti.Dom.createElement({
    $p : $body,
    tagName : "div",
    className : `ti-tinymce-obj-resize-handler at-${name}`,
    attrs : {
      "hdl-name" : name
    }
  })
}
///////////////////////////////////////////////////
function UpdateHandlerStyle(rect, {NW,NE,SW,SE}) {
  NW.style.left = rect.left+'px'
  NE.style.left = rect.right+'px'
  SW.style.left = rect.left+'px'
  SE.style.left = rect.right+'px'

  NW.style.top = rect.top+'px'
  NE.style.top = rect.top+'px'
  SW.style.top = rect.bottom+'px'
  SE.style.top = rect.bottom+'px'
}
///////////////////////////////////////////////////
export default {
  //-----------------------------------------------
  redrawResizeHandler(el) {
    let editor = this.$editor
    // Remove old handler
    let $hs = editor.$('.ti-tinymce-obj-resize-handler')
    $hs.remove()

    // Guard
    if(!_.isElement(el) || !el.getAttribute("data-mce-selected")){
      return
    }

    // Get resize target
    let resizeMode = el.getAttribute("ti-tinymce-obj-resizable")
    // Guard
    if("style" != resizeMode) {
      return
    }

    // Find resize obj
    let $ta = Ti.Dom.find("[ti-resize-target]", el) || el

    //console.log("redrawResizeHandler", el)
    // Create rect
    let $body = editor.$('body')[0]
    if(el == $body) {
      return
    }

    // Prepare two window obj
    const winIn  = $body.ownerDocument.defaultView
    const winOut =  this.$el.ownerDocument.defaultView

    // Count measure
    let rect = Ti.Rects.createBy($ta)
    rect.y += winIn.scrollY
    rect.updateBy("xywh")

    

    // Draw new resize handler
    let hdls = {}
    hdls.NW = CreateHandler($body, "nw")
    hdls.NE = CreateHandler($body, "ne")
    hdls.SW = CreateHandler($body, "sw")
    hdls.SE = CreateHandler($body, "se")
    UpdateHandlerStyle(rect, hdls)

    // Current handler
    let currentHdl = {}

    const OnMouseMove = (evt)=>{
      let {startX, startY, width, height} = currentHdl
      let {pageX, pageY} = evt
      let offX = Math.round(pageX - startX)
      let offY = Math.round(pageY - startY)
      let w = Math.max(10, width  + offX)
      let h = Math.max(10, height + offY)
      //console.log({offX,offY,w, h}, target)
      $ta.style.width  = w + 'px';
      $ta.style.height = h + 'px';
      // rect.width  = w
      // rect.height = h
      // rect.updateBy()
      let rect = Ti.Rects.createBy($ta)
      UpdateHandlerStyle(rect, hdls)
    }

    // Prepare the callback functions
    const OnMouseUp = ()=>{
      //console.log("mouseup")

      // Remove event handler
      winIn.removeEventListener("mousemove", OnMouseMove, true)
      winIn.removeEventListener("mouseup", OnMouseUp, true)
      winOut.removeEventListener("mouseup", OnMouseUp, true)

      $ta.removeAttribute("data-mce-style");

      _.delay(()=>{
        $body.removeAttribute("ti-tinymce-no-select")
        $body.contentEditable = true
        this.syncContent()
      }, 100)
    }

    // Start
    const OnMouseDown = (evt)=>{
      evt.stopPropagation()
      currentHdl.target = evt.target
      currentHdl.name = evt.target.getAttribute("hdl-name")
      let hR = Ti.Rects.createBy(evt.target)
      currentHdl.startX = hR.x
      currentHdl.startY = hR.y + winIn.scrollY
      currentHdl.width  = rect.width
      currentHdl.height = rect.height
      // Stop selection
      $body.setAttribute("ti-tinymce-no-select", true)
      $body.contentEditable = false
      //console.log("mousedown", evt)
      // Watch the mouse up
      winIn.addEventListener("mousemove", OnMouseMove, true)
      winIn.addEventListener("mouseup", OnMouseUp, true)
      winOut.addEventListener("mouseup", OnMouseUp, true)
    }

    // Attache events
    hdls.NW.addEventListener("mousedown", OnMouseDown, true)
    hdls.NE.addEventListener("mousedown", OnMouseDown, true)
    hdls.SW.addEventListener("mousedown", OnMouseDown, true)
    hdls.SE.addEventListener("mousedown", OnMouseDown, true)
    // Add event listener
  }
  //-----------------------------------------------
  //-----------------------------------------------
}