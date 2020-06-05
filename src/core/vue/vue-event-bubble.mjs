///////////////////////////////////////////////////
const TryBubble = function(vm, event, stop=false) {
  if(vm.$parent && !stop) {
    // Customized bubble
    if(_.isFunction(vm.__before_bubble)) {
      event = vm.__before_bubble(event) || event
    }
    // Notify parent
    vm.$parent.$notify(event.name, ...event.args);
  }
}
///////////////////////////////////////////////////
const Notify = function(name, ...args) {
  // if(name.endsWith("select"))
  //   console.log("Notify:", 
  //   `${_.padStart(name, 30, '~')} @ <${_.padEnd(this.tiComId, 15, ' ')}>`,
  //   args)
  // Prepare the return object, if stop=true will cancel the bubble
  let event = {name, args}
  let stop = false
  let handler;

  // Handle by customized dispatcher
  if(_.isFunction(this.__on_events)) {
    handler = this.__on_events(name, ...args)
  }
  // Handle by Vue primary listeners
  if(!_.isFunction(handler)) {
    handler = _.get(this.$listeners, name)
  }
  // Then try fallback
  if(!_.isFunction(handler)){
    handler = this.$tiEventTryFallback(name, this.$listeners)
  }

  // Invoke handler or bubble the event
  if(_.isFunction(handler)){
    // If find a event handler, dont't bubble it
    // unless the handler tell me to bubble by return:
    //  - true/false
    //  - {stop:false}
    // If return undefined, treat it as {stop:true}
    let reo = handler(...event.args)
    stop = true
    // handler indicate the stop bubble
    if(_.isBoolean(reo)) {
      stop = reo
    }
    // {stop:true}
    else if(reo && _.isBoolean(reo.stop)) {
      stop = reo.stop
    }
    // Try bubble
    TryBubble(this, event, stop)
  }
  // Then bubble it
  else {
    TryBubble(this, event)
  }
}
///////////////////////////////////////////////////
export const VueEventBubble = {
  install(Vue, {overrideEmit=false}={}) {
    // Append the methods
    _.assign(Vue.prototype, {
      //...........................................
      $notify : Notify,
      //...........................................
      $tiEventTryFallback(name, routing={}){
        let canNames = _.split(name, "::")
        while(canNames.length > 1) {
          let [, ...names] = canNames
          let hdName = names.join("::")
          let handler = _.get(routing, hdName)
          if(handler){
            return handler
          }
          canNames = names
        }
      }
      //...........................................
    })

    // Override emit
    if(overrideEmit) {
      Vue.mixin({
        created : function() {
          this.$emit = Notify
        }
      })
    }
  }
}