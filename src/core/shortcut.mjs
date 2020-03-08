///////////////////////////////////////
export const TiShortcut = {
  /***
   * Get the function from action
   * 
   * @param action{String|Object|Function}
   * @param funcBy{Function} : Cutomized function generator
   *    with arguments `({mode, name, args}, context):Function`.
   *    the `context` should be the `contextBy` result.
   *    If without defined or return undefined, it will get the 
   *    function from context by {context, mode, name}
   * @param wait{Number} : If `>0` it will return the debounce version
   * 
   * @return {Function} the binded function call.
   */
  genActionInvoking(action, funcBy, {wait=0}={}) {
    //..........................................
    const __bind_it = fn => {
      return wait > 0
        ? _.debounce(fn, wait)
        : fn
    }
    //..........................................
    // Command in Function
    if(_.isFunction(action)) {
      return __bind_it(action)
    }
    //..........................................
    let mode, name, args;
    //..........................................
    // Command in String
    if(_.isString(action)) {
      let m = /^([$a-zA-Z0-9_]+):([^()]+)(\((.*)\))?$/.exec(action)
      mode = m[1]
      name = m[2]
      args = m[4]
    }
    //..........................................
    // Command in object
    else if(_.isPlainObject(action)) {
      mode = action.mode
      name = action.name
      args = action.args
    }
    //..........................................
    let _a0  = {mode, name, args: Ti.S.toArray(args)}
    let func = Ti.Invoke(funcBy, [_a0])
    //..........................................
    // Gurad
    if(!_.isFunction(func)) {
      throw Ti.Err.make("e.invalid.action : " + action, {action})
    }
    //..........................................
    return __bind_it(func)
    //..........................................
  },
  /***
   * Get uniquekey for a keyboard event object
   * 
   * @param $event{Event} - the Event like object with
   *  `{"key", "altKey","ctrlKey","metaKey","shiftKey"}`
   * @param sep{String} - how to join the multi-keys, `+` as default
   * @param mode{String} - Method of key name transformer function:
   *  - `"upper"` : to upport case
   *  - `"lower"` : to lower case
   *  - `"camel"` : to camel case
   *  - `"snake"` : to snake case
   *  - `"kebab"` : to kebab case
   *  - `"start"` : to start case
   *  - `null`  : keep orignal
   * 
   * @return Unique Key as string
   */
  getUniqueKey($event, {sep="+", mode="upper"}={}) {
    let keys = []
    if($event.altKey) {keys.push("ALT")}
    if($event.ctrlKey) {keys.push("CTRL")}
    if($event.metaKey) {keys.push("META")}
    if($event.shiftKey) {keys.push("SHIFT")}

    let k = Ti.S.toCase($event.key, mode)

    if(!/^(ALT|CTRL|CONTROL|SHIFT|META)$/.test(k)) {
      keys.push(" " === k ? "SPACE" : k)
    }

    return keys.join(sep)
  },
  /***
   * Watch the top window keyboard events
   */
  startListening() {
    // Prevent multiple listening
    if(this.isListening)
      return
    // Do listen
    window.addEventListener("keydown", ($event)=>{
      // get the unify key code
      let uniqKey = TiShortcut.getUniqueKey($event)

      // Top App
      let app = Ti.App.topInstance()
      
      // Then try to find the action
      if(app) {
        app.fireShortcut(uniqKey, $event)
      }
    })
    // Mark
    this.isListening = true
  }
}
///////////////////////////////////////
export default TiShortcut