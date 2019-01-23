export const TiVue = {
  /***
  Generated a new configuration object for `Vuex.Store` to generated a new Vuex instance. It will build sub-modules deeply by invoke self recursively.

  @params
  - `conf{Object}` the TiApp Configuration Object

  @return A New Configuration Object
  */
  StoreConfig(conf={}) {
    // Just pick necessary fields from conf obj
    let sc = {
      state : _.partial(_.cloneDeep, conf.state||{}),
      mutations : conf.mutaions,
      actions : conf.actions,
      getters : conf.getters
    }
    // Join modules
    if(_.isArray(conf.modules) && conf.modules.length > 0) {
      sc.modules = {}
      for(let mc of conf.modules) {
        let mo = TiVue.StoreConfig(mc)
        mo.namespaced = true
        sc.modules[mc.name] = mo
      }
    }
    // Return then
    return sc
  }
}