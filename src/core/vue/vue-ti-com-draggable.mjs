function TiDraggable($el, setup, {context}) {
  let vm = context
  let {
    trigger,     // Which element will trigger the behavior
    viewport,    // The dragging viewport, default is $el
    handler = null,  // Dragging handle default is trigger
    // Callback to dealwith dragging
    // Function(context)
    dragging,
    // Function(context)
    prepare = _.identity,
    // Function(context)
    done =  _.identity,
  } = setup.value
  //-----------------------------------------------
  if(!_.isFunction(dragging)) {
    return
  }
  //-----------------------------------------------
  $el.addEventListener("mousedown", function(evt){
    //console.log(evt, trigger)
    // Find the trigger
    let $trigger = Ti.Dom.eventCurrentTarget(evt, trigger, vm.$el)
    if(!_.isElement($trigger)) {
      return
    }
    // Enter dragmode
    let $body = $el.ownerDocument.body
    let $viewport = Ti.Dom.find(viewport, $el)
    let $handler  = Ti.Dom.find(handler, $el) || $trigger
    let context = _.pick(evt, "clientX", "clientY")
    _.assign(context, {
      $body, $viewport, $handler, $trigger
    })

    // Guard
    if(!_.isElement($viewport) || !_.isElement($handler)) {
      return
    }

    // Count the view/handler
    context.viewport = Ti.Rects.createBy($viewport)
    context.handler = Ti.Rects.createBy($handler) 
    context.evalScale = function() {
      let {width, height, left, top} = this.viewport
      //console.log(this.viewport.tagName, {width, left, clientX:this.clientX})
      this.x = this.clientX - left
      this.y = this.clientY - top
      this.scaleX = this.x / width
      this.scaleY = this.y / height
    }

    // Prepare
    context.evalScale();
    context = prepare(context) || context

    //---------------------------------------------
    function OnBodyMouseMove(evt) {
      context.clientX = evt.clientX
      context.clientY = evt.clientY
      context.evalScale()
      dragging(context)
    }
    //---------------------------------------------
    function RemoveDraggle(evt) {
      $body.removeEventListener("mousemove", OnBodyMouseMove, true)
      $body.removeEventListener("mouseup", RemoveDraggle, true)

      context.clientX = evt.clientX
      context.clientY = evt.clientY
      context.evalScale()
      done(context)
    }
    //---------------------------------------------
    // Watch dragging in body
    $body.addEventListener("mousemove", OnBodyMouseMove, true)
    
    // Quit 
    $body.addEventListener("mouseup", RemoveDraggle, true)
  })
  //-----------------------------------------------
}
export default TiDraggable;