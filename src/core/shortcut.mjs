///////////////////////////////////////
const TiShortcut = {
  /***
   * Routing events by setup:
   * 
   * {
   *    //...............................
   *    // Object call
   *    "$EventName1" : {
   *       "global": "Ti.Aler",
   *       "root": "methodNameInRootInstance",
   *       "main": "methodNameInMainCom",
   *       "dispatch": "main/xxx"
   *       "commit": "main/xxxx",
   *       "payload": {
   *          "someKey": "=$args[0].id"
   *       }
   *    },
   *    //...............................
   *    // String => GenInvoking
   *    "$EventName2" : "Ti.Alert('haha')",
   *    //...............................
   *    // Customized Function
   *    "$EventName3" : function(){...}
   *    //...............................
   *    // Batch Call
   *    "$EventName1" : [
   *        Object,
   *        String,
   *        Function
   *    ]
   *    //...............................
   * }
   */
  genEventActionInvoking(at, input = {}) {
    // Guard
    if (!at) {
      return
    }
    let { app, context, funcSet } = input
    let funcList = []
    //---------------------------------
    // Batch call
    if (_.isArray(at)) {
      for (let a of at) {
        let func = TiShortcut.genEventActionInvoking(a, input)
        if (func) {
          funcList.push(func)
        }
      }
    }
    //---------------------------------
    // pick one invoke mode ...
    else {
      //-------------------------------
      // String => GenInvoking
      if (_.isString(at)) {
        let func = Ti.Util.genInvoking(fn, {
          context,
          dft: null,
          funcSet
        })
        if (func)
          funcList.push(func)
      }
      //-------------------------------
      // Customized Function
      else if (_.isFunction(at)) {
        funcList.push(at)
      }
      //-------------------------------
      // Eval payload
      else {
        let pld = Ti.Util.explainObj(context, at.payload, { evalFunc: true })
        //-----------------------------
        // Object call: commit
        if (at.commit) {
          funcList.push(function(){
            app.commit(at.commit, pld)
          })
        }
        //-----------------------------
        // Object call: dispatch
        if (at.dispatch) {
          funcList.push(function(){
            app.dispatch(at.dispatch, pld)
          })
        }
        //-----------------------------
        // Object call: global
        if (at.global) {
          funcList.push(function(){
            app.global(at.global, pld)
          })
        }
        //-----------------------------
        // Object call: main
        if (at.main) {
          funcList.push(function(){
            app.main(at.main, pld)
          })
        }
        //-----------------------------
        // Object call: root
        if (at.root) {
          funcList.push(function(){
            app.root(at.root, pld)
          })
        }
        //-----------------------------
        // Rewrite event bubble
        if(!Ti.Util.isNil(at.eventRewrite)) {
          funcList.push(function(){
            return at.eventRewrite
          })
        }
        //-----------------------------
      }
      //-------------------------------
    }
    //---------------------------------
    // Then return the action call
    if (!_.isEmpty(funcList)) {
      if (funcList.length == 1) {
        return funcList[0]
      }
      return async function (...args) {
        let re;
        for (let func of funcList) {
          re = await func.apply(context, args)
        }
        return re
      }
    }
    //---------------------------------
  },
  /***
   * Get the function from action
   * 
   * @param action{String|Object|Function}
   * @param $com{Vue|Function}: function for lazy get Vue instance
   * @param argContext{Object}
   * @param wait{Number} : If `>0` it will return the debounce version
   * 
   * @return {Function} the binded function call.
   */
  genActionInvoking(action, {
    $com,
    argContext = {},
    wait = 0,
  } = {}) {
    // if(action.indexOf("projIssuesImport") > 0)
    //   console.log("genActionInvoking", action)
    //..........................................
    const __bind_it = fn => {
      return wait > 0
        ? _.debounce(fn, wait, { leading: true })
        : fn
    }
    //..........................................
    const __vm = com => {
      if (_.isFunction(com))
        return com()
      return com
    }
    //..........................................
    // Command in Function
    if (_.isFunction(action)) {
      return __bind_it(action)
    }
    //..........................................
    let mode, name, args;
    //..........................................
    // Command in String
    if (_.isString(action)) {
      let m = /^((global|commit|dispatch|root|main|\$\w+):|=>)([^()]+)(\((.*)\))?$/.exec(action)
      if (!m) {
        throw Ti.Err.make("e.action.invalid : " + action, { action })
      }
      mode = m[2] || m[1]
      name = m[3]
      args = m[5]
    }
    //..........................................
    // Command in object
    else if (_.isPlainObject(action)) {
      mode = action.mode
      name = action.name
      args = action.args
    }
    //..........................................
    // explain args
    let __as = Ti.S.joinArgs(args, [], v => {
      return Ti.S.toJsValue(v, { context: argContext })
    })
    let func;
    //..........................................
    // Arrow invoke
    if ("=>" == mode) {
      let fn = _.get(window, name)
      if (!_.isFunction(fn)) {
        throw Ti.Err.make("e.action.invoke.NotFunc : " + action, { action })
      }
      func = () => {
        let vm = __vm($com)
        fn.apply(vm, __as)
      }
    }
    //..........................................
    // $emit:
    else if ("$emit" == mode || "$notify" == mode) {
      func = () => {
        let vm = __vm($com)
        if (!vm) {
          throw Ti.Err.make("e.action.emit.NoCom : " + action, { action })
        }
        vm[mode](name, ...__as)
      }
    }
    //..........................................
    // $parent: method
    else if ("$parent" == mode) {
      func = () => {
        let vm = __vm($com)
        let fn = vm[name]
        if (!_.isFunction(fn)) {
          throw Ti.Err.make("e.action.call.NotFunc : " + action, { action })
        }
        fn.apply(vm, __as)
      }
    }
    //..........................................
    // App Methods
    else {
      func = () => {
        let vm = __vm($com)
        let app = Ti.App(vm)
        let fn = app[mode]
        let _as2 = _.concat(name, __as)
        fn.apply(app, _as2)
      }
    }
    //..........................................
    // Gurad
    if (!_.isFunction(func)) {
      throw Ti.Err.make("e.invalid.action : " + action, { action })
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
  getUniqueKey($event, { sep = "+", mode = "upper" } = {}) {
    let keys = []
    if ($event.altKey) { keys.push("ALT") }
    if ($event.ctrlKey) { keys.push("CTRL") }
    if ($event.metaKey) { keys.push("META") }
    if ($event.shiftKey) { keys.push("SHIFT") }

    let k = Ti.S.toCase($event.key, mode)

    if (!/^(ALT|CTRL|CONTROL|SHIFT|META)$/.test(k)) {
      keys.push(" " === k ? "SPACE" : k)
    }

    return keys.join(sep)
  },
  /***
   * Watch the top window keyboard events
   */
  startListening() {
    // Prevent multiple listening
    if (this.isListening)
      return
    // Do listen
    window.addEventListener("keydown", ($event) => {
      // get the unify key code
      let uniqKey = TiShortcut.getUniqueKey($event)

      // Top App
      let app = Ti.App.topInstance()

      // Then try to find the action
      if (app) {
        app.fireShortcut(uniqKey, $event)
      }
    })
    // Mark
    this.isListening = true
  }
}
///////////////////////////////////////
export const Shortcut = TiShortcut