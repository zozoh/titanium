//-----------------------------------
class Shortcut {
  constructor(){
    this.reset()
  }
  reset($app=null) {
    this.$app = $app
    this.actions = {}
    return this
  }
  bind(action) {
    let m = /^([a-z]+):(.+)$/.exec(action)
    if(m) {
      let func = this.$app[m[1]]
      let arg  = m[2]
      return _.bind(func, this.$app, arg)
    }
    return function(){
      alert("invalid action: [" + action + "]")
    }
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
  fire(uniqKey) {
    let func = this.actions[uniqKey]
    if(_.isFunction(func)) {
      func()
      return true
    }
    return false
  }
}
//-----------------------------------
const THE_SHORTCUT = new Shortcut()
//-----------------------------------
export const TiShortcut = {
  watch($app, actions) {
    THE_SHORTCUT.reset($app).addWatch(actions)
  },
  startListening() {
    window.addEventListener("keydown", (evt)=>{
      // get the unify key code
      let keys = []
      if(evt.altKey) {keys.push("ALT")}
      if(evt.ctrlKey) {keys.push("CTRL")}
      if(evt.metaKey) {keys.push("META")}
      if(evt.shiftKey) {keys.push("SHIFT")}
      
      let k = _.kebabCase(evt.key).toUpperCase()
      if(!/^(ALT|CONTROL|SHIFT|META)$/.test(k)) {
        keys.push(k)
      }

      let uniqKey = keys.join("+")
      
      // Then try to find the action
      if(THE_SHORTCUT.fire(uniqKey)) {
        if(Ti.IsInfo()) {
          console.log("TiShortcut.fired", uniqKey)
        }
        evt.preventDefault()
        evt.stopPropagation()
      }
    })
  }
}
//-----------------------------------
export default TiShortcut
