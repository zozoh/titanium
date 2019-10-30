//-----------------------------------
class Shortcut {
  constructor(){
    this.reset()
  }
  watch($app, actions=[]) {
    this.reset($app).addWatch($app, actions)
  }
  reset($app=null) {
    this.$app = $app
    this.actions = {}
    this.guards = {}
    return this
  }
  addWatch(scope, actions=[]) {
    scope = scope || this.$app
    let as = _.without(_.concat(actions),null)
    _.forEach(as, (aIt)=>{
      // Groups, recur ...
      if('group' == aIt.type 
         && _.isArray(aIt.items)
         && aIt.items.length > 0) {
        this.addWatch(scope, aIt.items)
      }
      // Action
      else if(aIt.action && aIt.shortcut) {
        // Guarding for duplicated watching
        if(this.isWatched(scope, aIt.shortcut)) {
          return
        }
        //this.actions[aIt.shortcut] = this.bind(aIt.action)
        Ti.Util.pushValue(this.actions, aIt.shortcut, {
          scope,
          func : this.bind(aIt.action)
        })
      }
    })
  }
  isWatched(scope, shortcutKey) {
    scope = scope || this.$app
    let as = this.actions[shortcutKey]
    if(_.isArray(as)) {
      for(let a of as) {
        if(a.scope === scope) {
          return true
        }
      }
    }
    return false
  }
  removeWatch(scope, shortcutKeys=[]) {
    scope = scope || this.$app
    // Remove All
    let keys = shortcutKeys
    if(_.isEmpty(keys)) {
      keys = _.keys(this.actions)
    }
    // Remove in loop
    for(let k of keys) {
      let as = this.actions[k]
      if(_.isArray(as)) {
        // Repare the new watch list
        let as2 = []
        for(let a of as) {
          if(a.scope === scope) {
            // Do Nothing to remove it
          }
          // Pick back
          else {
            as2.push(a)
          }
        }
        // Clear 
        if(_.isEmpty(as2)) {
          delete this.actions[k]
        }
        // Or Reset
        else {
          this.actions[k] = as2
        }
      }
    }
  }
  bind(action) {
    // Command in Function
    if(_.isFunction(action)) {
      return action
    }
    // Command In String
    let m = /^([a-zA-Z0-9_]+):([^()]+)(\((.+)\))?$/.exec(action)
    if(m) {
      let func = this.$app[m[1]]
      let tanm = m[2]
      if(_.isFunction(func) && tanm) {
        let args = [tanm]
        if(m[4]) {
          let payload = Ti.S.toJsValue(m[4])
          args.push(payload)
        }
        return _.debounce(_.bind(func, this.$app, ...args), 500, {
          leading  : true,
          trailing : false
        })
      }
      // Fail to found function in current app
      else {
        throw Ti.Err.make("e-ti-shortcut-InvalidAction", action)
      }
    }
    return function(){
      alert("invalid action: [" + action + "]")
    }
  }
  /***
   * ComUI can append the guard later for block one process.
   * 
   * For example, if we provide the `saving` operation in action menu
   * with `CTRL+S` shortcut, but we want to fire the action only if 
   * the `content` changed. So we will detected the content change 
   * and mark it in UI to present the status to user. When user process
   * `CTRL+S` we also want to block the action if content without changed.
   * For the reason most UI was been loaded asynchronous, so we need provide
   * a way to those UIs to append the `guard` before the action invoking.
   * 
   * @param uniqKey{String} : The shortcut key like `CTRL+S`
   * @param guard{Function} : synchronized function, return false to block
   */
  addGuard(uniqKey, guard) {
    this.guards[uniqKey] = guard
  }
  /***
   * Fire an action
   *
   * @param uniqKey{String} : The shortcut key like `CTRL+S`
   * 
   * @return Boolean for fired status:
   *  - `true` : action found, if the guard block it, still true
   *  - `false` : action not found
   */
  fire(uniqKey) {
    // fire the action
    let as = this.actions[uniqKey]
    // Guard
    if(!_.isArray(as) || _.isEmpty(as)) {
      return false
    }
    // Invoking function list
    _.forEach(as, ({func})=>{
      if(_.isFunction(func)) {
        // ask guard firstly
        let guard = this.guards[uniqKey]

        // invoke the action
        if(!_.isFunction(guard) || guard()){
          func()
        }
      }
    })
    // All done    
    return true
  }
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
      keys.push(k)
    }

    return keys.join(sep)
  }
  startListening() {
    // Prevent multiple listening
    if(this.isListening)
      return
    // Do listen
    window.addEventListener("keydown", ($event)=>{
      // get the unify key code
      let uniqKey = this.getUniqueKey($event)

      if(Ti.IsDebug("TiShortcut")) {
        console.log("TiShortcut.detected", uniqKey)
      }
      
      // Then try to find the action
      if(this.fire(uniqKey)) {
        if(Ti.IsInfo("TiShortcut")) {
          console.log("TiShortcut.fired", uniqKey)
        }
        $event.preventDefault()
        $event.stopPropagation()
      }
    })
    // Mark
    this.isListening = true
  }
}
//-----------------------------------
export const TiShortcut = new Shortcut()
//-----------------------------------
export default TiShortcut
