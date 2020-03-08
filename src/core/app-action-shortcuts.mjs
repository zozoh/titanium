export class TiAppActionShortcuts {
  //////////////////////////////////////////////
  // Attributes
  //////////////////////////////////////////////
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
   * - `key` : The shortcut key like `CTRL+S`
   * - `value` : synchronized function, return false to block
   * 
   * ```
   * {
   *   "CTRL+S" : [{
   *      // object scope, like $app or $com
   *      // If undefined, take it as $app
   *      scope : Any,
   *      // Guard function,
   *      func  : f():Boolean
   *   }]
   * }
   * ```
   */
  guards = {}
  /***
   * Save the actions shortcut mapping
   * 
   * ```
   * {
   *   "CTRL+S" : [{
   *      // object scope, like $app or $com
   *      // If undefined, take it as $app
   *      scope : Any,
   *      // Binding function to invoke the action
   *      func  : f():Boolean to quit,
   *      prevent : true,
   *      quit    : true
   *   }]
   * }
   * ```
   */
  actions = {}
  //////////////////////////////////////////////
  // Methods
  //////////////////////////////////////////////
  bindInvoke(scope, action, wait=100) {
    return Ti.Shortcut.genActionInvoking(action, ({mode,name,args})=>{
      let app = Ti.App.topInstance()
      let fn = _.get(app, mode)
      if(_.isFunction(fn)) {
        let __args = Ti.S.joinArgs(args, [name])
        return ()=>fn.apply(app, __args)
      }
      throw `AppShortcuts.action noexits: ${mode}.${name}(${args.join(",")})`
    }, {wait})
  }
  //--------------------------------------------
  isWatched(uniqKey, scope) {
    let as = this.actions[uniqKey]
    if(_.isArray(as)) {
      for(let a of as) {
        if(a.scope === scope) {
          return true
        }
      }
    }
    return false
  }
  //--------------------------------------------
  watch(actions=[], scope) {
    let list = _.without(_.concat(actions), null)
    _.forEach(list, aIt => {
      // Groups, recur ...
      if('group' == aIt.type 
         && _.isArray(aIt.items)
         && aIt.items.length > 0) {
        this.watch(aIt.items, scope)
      }
      // Action
      else if(aIt.action && aIt.shortcut) {
        // Guarding for duplicated watching
        if(this.isWatched(aIt.shortcut, scope)) {
          return
        }
        // Join to watch list
        Ti.Util.pushValueBefore(this.actions, aIt.shortcut, {
          scope,
          func : this.bindInvoke(scope, aIt.action, aIt.wait),
          prevent : Ti.Util.fallback(aIt.prevent, true),
          stop    : Ti.Util.fallback(aIt.stop, true)
        })
      }
    })
  }
  //--------------------------------------------
  addGuard(uniqKey, guard, scope) {
    if(uniqKey && _.isFunction(guard)) {
      Ti.Util.pushValue(this.guards, uniqKey, {scope, func:guard})
    }
  }
  //--------------------------------------------
  unwatch(scope, ...uniqKeys) {
    this.__remove_by(this.actions, scope, uniqKeys)
    this.__remove_by(this.guards, scope, uniqKeys)
  }
  //--------------------------------------------
  __remove_by(map, scope, ...uniqKeys) {
    let keys = _.flattenDeep(uniqKeys)
    // Remove All
    if(!scope && _.isEmpty(keys)) {
      return {}
    }
    // Remove in loop
    else {
      let scopeIsNil = Ti.Util.isNil(scope)
      let map2 = {}
      _.forEach(keys, k => {
        let list = []
        _.forEach(map[k], a => {
          if(!scopeIsNil && a.scope !== scope) {
            list.push(a)
          }
        })

        // Join back
        if(!_.isEmpty(list)) {
          map2[k] = list
        }
      })
      return map2
    }
  }
  //--------------------------------------------
  /***
   * @param scope{Any}
   * @param uniqKey{String} : like "CTRL+S"
   * @param st{OBject} : return object
   */
  fire(scope, uniqKey, st = {
    stop    : false,
    prevent : false,
    quit    : false
  }) {
    //..........................................
    // if("ALT+SHIFT+T" == uniqKey)
    //   console.log("AppActionShortcuts.fired", uniqKey)
    if(st.quit) {
      return st
    }
    //..........................................
    let scopeIsNil = Ti.Util.isNil(scope)
    //..........................................
    // Ask guards
    let guards = this.guards[uniqKey]
    if(_.isArray(guards)) {
      for(let g of guards) {
        if(scopeIsNil || g.scope === scope) {
          if(!g.func()) {
            st.quit = true
            return st
          }
        }
      }
    }
    //..........................................
    // fire the action list
    let as = this.actions[uniqKey]
    if(!_.isArray(as)) 
      return st
    //..........................................
    for(let a of as) {
      if(scopeIsNil || a.scope === scope) {
        st.quit    |= a.func()
        st.stop    |= a.stop
        st.prevent |= a.prevent
        // Quit not
        if(st.quit) {
          return st
        }
      }
    }
    //..........................................
    return st
  }
  //--------------------------------------------
}