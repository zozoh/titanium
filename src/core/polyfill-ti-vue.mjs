import {Ti} from './ti.mjs'
//---------------------------------------
function do_map_xxx(modPath, setting) {
  const re = {}
  _.forOwn(setting, (val, key)=>{
    let methodName = "map"+_.capitalize(key)
    // Map namespaced module
    if(modPath) {
      _.assign(re, Vuex[methodName](modPath, val))
    }
    // Map general
    else {
      _.assign(re, Vuex[methodName](val))
    }
  })
  return re
}
//---------------------------------------
function do_extend_setting(store, obj) {
  let is_extendable = false;
  let re = {}
  _.forOwn(obj, (val, key, obj)=>{
    let m = /^\.{3}(.*)$/.exec(key)
    if(m) {
      is_extendable = true
      let modPath = m[1]
      if(store) {
        _.assign(re, do_map_xxx(modPath, val))
      }
    }
  })
  return is_extendable ? re : obj
}
//---------------------------------------
export const TiVue = {
  /***
  Generated a new configuration object for `Vuex.Store` to generated a new Vuex instance. It will build sub-modules deeply by invoke self recursively.

  @params
  - `conf{Object}` : Configuration object of `app.store | app.store.modules[n]`

  @return A New Configuration Object
  */
  StoreConfig(conf={}) {
    // Pick necessary fields
    let sc = {
      state : Ti.Util.genObj(conf.state),
      mutations : Ti.Util.merge({}, conf.mutations),
      actions   : Ti.Util.merge({}, conf.actions),
      getters   : Ti.Util.merge({}, conf.getters)
    }
    // namespaced module
    if(conf.namespaced)
      sc.namespaced = true
    // Join modules
    if(_.isArray(conf.modules) && conf.modules.length > 0) {
      sc.modules = {}
      for(let mc of conf.modules) {
        let mo = TiVue.StoreConfig(mc)
        sc.modules[mc.name] = mo
      }
    }
    // Return then
    return sc
  },
  //---------------------------------------
  CreateStore(storeConf) {
    return new Vuex.Store({
      strict : Ti.IsForDev(),
      ...storeConf
    })
  },
  //---------------------------------------
  Options({global={}, conf={}, store}={}) {
    //.............................
    // Pick necessary fields
    //.............................
    /*Data*/
    const Data = _.pick(conf, [
      "data",
      /*form like `props:[..]` would not be supported*/
      "props",
      /*computed|methods will be deal with later*/
      "watch"])
    //.............................
    /*DOM*/
    const DOM = _.pick(conf, [
      "template",
      "render",
      "renderError"])
    //.............................
    /*Lifecycle Hooks*/
    const LifecycleHooks = _.pick(conf.hooks, [
      "beforeCreate",
      "created",
      "beforeMount",
      "mounted",
      "beforeUpdate",
      "updated",
      "activated",
      "deactivated",
      "beforeDestroy",
      "destroyed",
      "errorCaptured"])
    //.............................
    /*Assets*/
    // Find global Assets
    const Assets = _.pick(conf, [
      "directives",
      "filters",
      "components"])
    const it_asset_part = function(val, key, obj) {
      //console.log("!!!", key, val)
      const list = _.flattenDeep([val])
      const remain = []
      for(let asset of list) {
        // => global
        if(asset.globally) {
          Ti.Util.pushValue(global, key, asset)
        }
        // => key
        else {
          remain.push(asset)
        }
      }
      obj[key] = remain
    }
    _.forOwn(Assets, it_asset_part)
    //.............................
    /*Composition*/
    const Composition = _.pick(conf, [
      "mixins",
      "extends"])
    //.............................
    /*Misc*/
    const Misc = _.pick(conf, [
      "name",        /*com only*/
      "delimiters",
      "functional",
      "model",
      "inheritAttrs",
      "comments"])
    //.............................
    // create options
    let options = {
      ..._.mapValues(
          Data, v=>Ti.Util.merge({}, v)),
      ... DOM,
      // LifecycleHooks
      ..._.mapValues(
          LifecycleHooks, Ti.Util.groupCall),
      // Asserts
      directives : Ti.Util.merge({}, Assets.directives),
      filters    : Ti.Util.merge({}, Assets.filters),
      // components should merge the computed/methods/watch
      components : (function(){
        let coms = {}
        _.map(Assets.components, com=>{
          coms[com.name] = TiVue.Options({
            conf : com, global
          })
        })
        return coms
      })(),
      // Composition
      ..._.mapValues(
          Composition, v=>Ti.Util.merge({}, v)),
      ... Misc
    }

    // thunk data
    if(!_.isFunction(options.data)) {
      options.data = Ti.Util.genObj(options.data || {})
    }

    //.............................
    // expend the "..." key like object for `computed/methods`
    // if without store defination, they will be dropped
    const merger = _.partial(do_extend_setting, store);
    if(_.isArray(conf.computed)) {
      options.computed = Ti.Util.mergeWith(
                            merger, {}, ...conf.computed)
    } else if(_.isObject(conf.computed)) {
      options.computed = conf.computed
    }
    
    if(_.isArray(conf.methods)) {
      options.methods = Ti.Util.mergeWith(
                            merger, {}, ...conf.methods)
    } else if(_.isObject(conf.methods)) {
      options.methods = conf.methods
    }

    //.............................
    // bind Vuex.store
    if(store)
      options.store = store

    // return the options
    return options
  },
  //---------------------------------------
  /***
  Generated a new conf object for `Vue` to generated a new Vue instance.

  @params
  - `conf{Object}` Configuration object of `app | app.components[n]`

  @return A New Configuration Object
  */
  Setup(conf={}, store) {
    const global  = {}
    const options = TiVue.Options({
      global, conf, store
    })
    
    // return the setup object
    return {
      global, options
    }
  },
  //---------------------------------------
  CreateInstance(setup) {
    // Global Assets
    const filters    = Ti.Util.merge({}, setup.global.filters)
    const directives = Ti.Util.merge({}, setup.global.directives)

    // filters
    _.forOwn(filters, (val, key)=>{
      Vue.filter(key, val)
    })
    
    // directives
    _.forOwn(directives, (val, key)=>{
      Vue.directive(key, val)
    })

    // components registration
    const defineComponent = com=>{
      // define sub
      _.map(com.components, defineComponent)
      delete com.components
      // define self
      Vue.component(com.name, com)
    }
    _.map(setup.global.components, defineComponent)

    // return new vm instance
    return new Vue(setup.options)
  }
}