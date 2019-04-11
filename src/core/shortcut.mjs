//-----------------------------------
class Shortcut {
  constructor(){
    this.reset()
  }
  watch($app, actions) {
    this.reset($app).addWatch(actions)
  }
  reset($app=null) {
    this.$app = $app
    this.actions = {}
    this.guards = {}
    return this
  }
  addWatch(actions) {
    _.forOwn(actions, (aIt)=>{
      // Groups, recur ...
      if('group' == aIt 
         && _.isArray(aIt.items)
         && aIt.items.length > 0) {
        this.addWatch(aIt.items)
      }
      // Action
      else if(aIt.action && aIt.shortcut) {
        this.actions[aIt.shortcut] = this.bind(aIt.action)
      }
    })
  }
  bind(action) {
    let m = /^([a-zA-Z0-9_]+):(.+)$/.exec(action)
    if(m) {
      let func = this.$app[m[1]]
      let arg  = m[2]
      if(!_.isFunction(func) || !arg) {
        throw Ti.Err.make("e-ti-shortcut-InvalidAction", action)
      }
      return _.debounce(_.bind(func, this.$app, arg), 500, {
        leading  : true,
        trailing : false
      })
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
    let func = this.actions[uniqKey]
    if(_.isFunction(func)) {
      // ask guard firstly
      let guard = this.guards[uniqKey]

      // invoke the action
      if(!_.isFunction(guard) || guard()){
        func()
      }
      
      return true
    }
    return false
  }
  startListening() {
    // Prevent multiple listening
    if(this.isListening)
      return
    // Do listen
    window.addEventListener("keydown", (evt)=>{
      // get the unify key code
      let keys = []
      if(evt.altKey) {keys.push("ALT")}
      if(evt.ctrlKey) {keys.push("CTRL")}
      if(evt.metaKey) {keys.push("META")}
      if(evt.shiftKey) {keys.push("SHIFT")}
      
      let k = evt.key.toUpperCase()
      if(!/^(ALT|CONTROL|SHIFT|META)$/.test(k)) {
        keys.push(k)
      }

      let uniqKey = keys.join("+")

      if(Ti.IsDebug("TiShortcut")) {
        console.log("TiShortcut.detected", uniqKey)
      }
      
      // Then try to find the action
      if(this.fire(uniqKey)) {
        if(Ti.IsInfo("TiShortcut")) {
          console.log("TiShortcut.fired", uniqKey)
        }
        evt.preventDefault()
        evt.stopPropagation()
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
