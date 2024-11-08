function TiDraggable($el, setup = {}) {
  //let vm = context
  let {
    trigger, // Which element will trigger the behavior
    viewport, // The dragging viewport, default is $el
    watchZone, // The dragging viewport, default is $el
    handler = null, // Dragging handle default is trigger
    // Speed Unit, move 1px per 1ms
    // default 100, mean: move 1px in 1ms, it was 100
    speed = 100,
    // If find the trigger, then should we active the dragging?
    testActive = () => true,
    // If the moved distance (offsetX or offsetY) over the value(in PX)
    // it will active dragging
    // If object form like {x:50, y:-1}
    // just actived when x move distance over the indicated value
    activedRadius = 0,
    // If the dragging duration (duInMs) over the value(in MS),
    // it will active dragging
    activedDelay = 0,
    // Function(context) call alway before call actived
    prepare = _.identity,
    // Callback to dealwith dragging
    // Function(context)
    dragging = _.identity,
    // Function(context)  call once first time context actived
    actived = _.identity,
    // Function(context)
    done = _.identity,
    // Function(context)  call alway when dragging quit
    finished = _.identity
  } = setup;
  //-----------------------------------------------
  // Format actived radius
  let AR = {};
  if (_.isNumber(activedRadius)) {
    AR.x = activedRadius;
    AR.y = activedRadius;
  } else {
    _.assign(AR, { x: -1, y: -1 }, _.pick(activedRadius, "x", "y"));
  }
  //-----------------------------------------------
  const findBy = function ($trigger, find, $dft) {
    if (_.isFunction(find)) {
      return find($trigger) || $dft;
    }
    if (_.isString(find)) {
      return Ti.Dom.find(find, $el) || $dft;
    }
    return $dft;
  };
  //-----------------------------------------------
  let EVENTS = {
    setClientXY: function (ctx, evt) {
      let pe = this.getPointerEvent(evt);
      ctx.clientX = pe.clientX;
      ctx.clientY = pe.clientY;
    }
  };
  if (Ti.Dom.isTouchDevice()) {
    _.assign(EVENTS, {
      POINTER_DOWN: "touchstart",
      POINTER_MOVE: "touchmove",
      POINTER_UP: "touchend",
      //POINTER_CLICK  : "click",
      getPointerEvent: (evt) => evt.touches[0]
    });
  } else {
    _.assign(EVENTS, {
      POINTER_DOWN: "mousedown",
      POINTER_MOVE: "mousemove",
      POINTER_UP: "mouseup",
      POINTER_CLICK: "click",
      getPointerEvent: (evt) => evt
    });
  }
  //console.log(EVENTS)
  //-----------------------------------------------
  $el.addEventListener(EVENTS.POINTER_DOWN, function (evt) {
    //console.log(EVENTS.POINTER_DOWN, evt, {activedRadius, activedDelay})
    // Find the trigger
    let $trigger = Ti.Dom.eventCurrentTarget(evt, trigger, $el);
    if (!_.isElement($trigger)) {
      return;
    }
    // Enter dragmode
    let $doc = $el.ownerDocument;
    let $body = $el.ownerDocument.body;
    let $viewport = findBy($trigger, viewport, $el);
    let $watchZone = findBy($trigger, watchZone, $el.ownerDocument);
    let $handler = findBy($trigger, handler, $el);
    let context = {};
    _.assign(context, {
      $event: evt,
      $doc,
      $body,
      $viewport,
      $handler,
      $trigger,
      $watchZone
    });
    EVENTS.setClientXY(context, evt);
    context.$src = evt.srcElement;

    if (!testActive(context)) {
      return;
    }

    // Guard
    if (!_.isElement($viewport) || !_.isElement($handler)) {
      return;
    }

    // Count the view/handler
    context.__already_call_actived = false;
    context.watchZone = Ti.Rects.createBy($watchZone);
    context.viewport = Ti.Rects.createBy($viewport);
    context.handler = Ti.Rects.createBy($handler);
    context.startInMs = Date.now();
    //........................................
    context.initScale = function () {
      let { left, top } = this.viewport;
      this.nowInMs = Date.now();
      this.duInMs = this.nowInMs - this.startInMs;
      let x = this.clientX - left;
      let y = this.clientY - top;
      // First time, to init
      this.startX = x;
      this.startY = y;
      this.x = x;
      this.y = y;
      this.offsetX = 0;
      this.offsetY = 0;
      this.moveX = 0;
      this.moveY = 0;
      this.scaleX = 0;
      this.scaleY = 0;
    };
    //........................................
    context.evalScale = function () {
      let { width, height, left, top } = this.viewport;
      //console.log(this.viewport.tagName, {width, left, clientX:this.clientX})
      this.nowInMs = Date.now();
      this.duInMs = this.nowInMs - this.startInMs;
      let x = this.clientX - left;
      let y = this.clientY - top;

      this.offsetX = x - this.startX;
      this.offsetY = y - this.startY;
      this.offsetDistance = Math.sqrt(
        Math.pow(this.offsetX, 2) + Math.pow(this.offsetY, 2)
      );
      this.moveX = x - this.x;
      this.moveY = y - this.y;
      this.moveDistance = Math.sqrt(
        Math.pow(this.moveX, 2) + Math.pow(this.moveY, 2)
      );

      this.directionX = this.moveX < 0 ? "left" : "right";
      this.directionY = this.moveY < 0 ? "up" : "down";
      this.speed = (this.moveDistance * speed) / this.duInMs;
      //console.log("move:", this.speed, this.moveDistance+'px', this.duInMs+'ms')

      this.x = this.clientX - left;
      this.y = this.clientY - top;
      this.scaleX = x / width;
      this.scaleY = y / height;
      // Eval actived status
      if (!this.actived) {
        let offX = Math.abs(this.offsetX);
        let offY = Math.abs(this.offsetY);
        if (this.duInMs > activedDelay) {
          if (AR.x < 0 || offX > AR.x) {
            if (AR.y < 0 || offY > AR.y) {
              this.actived = true;
            }
          }
        }
      }
    };
    //........................................
    context.evalLeftBySpeed = function (left = 0) {
      let { viewport, $trigger, offsetX, speed } = this;
      if (speed > 1) {
        //console.log(left, speed * offsetX, {offsetX, speed})
        left += speed * offsetX;
      }
      let wScroller = $trigger.scrollWidth;
      let minLeft = viewport.width - wScroller;
      left = _.clamp(left, minLeft, 0);
      return left;
    };
    //........................................
    context.evalTopBySpeed = function (top = 0) {
      let { viewport, $trigger, offsetY, speed } = this;
      if (speed > 1) {
        top += speed * offsetY;
      }
      let hScroller = $trigger.scrollHeight;
      let minTop = viewport.height - hScroller;
      top = _.clamp(top, minTop, 0);
      return top;
    };
    //........................................
    // Prepare
    context.initScale();
    context = prepare(context, evt) || context;
    //---------------------------------------------
    function PreventClick(evt) {
      //console.log("PreventClick", evt)
      evt.preventDefault();
      evt.stopPropagation();
    }
    //---------------------------------------------
    function OnBodyMouseMove(evt) {
      // Test if leave
      let p = { x: context.clientX, y: context.clientY };
      //console.log("OnBodyMouseMove", p)
      if (!context.watchZone.hasPoint(p)) {
        RemoveDraggle(evt);
        return;
      }

      EVENTS.setClientXY(context, evt);
      context.evalScale();
      if (context.actived) {
        if (!context.__already_call_actived) {
          actived(context);
          context.__already_call_actived = true;
          // Then hold $src
          if (EVENTS.POINTER_CLICK) {
            context.$src.addEventListener(EVENTS.POINTER_CLICK, PreventClick, {
              capture: true,
              once: true
            });
          }
        }
        dragging(context);
      }
    }
    //---------------------------------------------
    function RemoveDraggle(evt) {
      //console.log("RemoveDraggle", context.actived)
      $doc.removeEventListener(EVENTS.POINTER_MOVE, OnBodyMouseMove, true);
      $doc.removeEventListener(EVENTS.POINTER_UP, RemoveDraggle, true);

      context.clientX = evt.clientX;
      context.clientY = evt.clientY;
      context.$stopEvent = evt;

      if (context.actived) {
        if (EVENTS.POINTER_CLICK) {
          context.$src.removeEventListener(EVENTS.POINTER_CLICK, PreventClick);
        }
        done(context);
      }

      finished(context);
    }
    //---------------------------------------------
    // Watch dragging in doc
    $doc.addEventListener(EVENTS.POINTER_MOVE, OnBodyMouseMove, true);

    // Quit
    $doc.addEventListener(EVENTS.POINTER_UP, RemoveDraggle, true);
  });
  //-----------------------------------------------
}
export default TiDraggable;
