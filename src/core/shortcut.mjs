///////////////////////////////////////
export const TiShortcut = {
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