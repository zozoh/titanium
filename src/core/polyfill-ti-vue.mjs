export const TiVue = {
  /***
  Generated a new configuration object for `Vuex.Store` to generated a new Vuex instance. It will build sub-modules deeply by invoke self recursively.

  @params
  - `options{Object}` the TiApp Configuration Object

  @return A New Configuration Object
  */
  StoreConfig(options={}) {
    // Just pick necessary fields from options obj
    let sc = {
      state : _.partial(_.cloneDeep, options.state||{}),
      mutations : _.assign({}, ...[].concat(options.mutaions)),
      actions   : _.assign({}, ...[].concat(options.actions)),
      getters   : _.assign({}, ...[].concat(options.getters))
    }
    // namespaced module
    if(options.namespaced)
      sc.namespaced = true
    // Join modules
    if(_.isArray(options.modules) && options.modules.length > 0) {
      sc.modules = {}
      for(let mc of options.modules) {
        let mo = TiVue.StoreConfig(mc)
        sc.modules[mc.name] = mo
      }
    }
    // Return then
    return sc
  },
  /***
  Generated a new options object for `Vue` to generated a new Vue instance.
  */
  
}