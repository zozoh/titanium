import {Ti} from './ti.mjs'
import {LoadTiLinkedObj, BASE} from "./app_info.mjs"
//---------------------------------------
export const TiVue = {
  //---------------------------------------
  async LoadVuexModule(modConf={}, base=modConf[BASE]) {
    if(!base)
      return
    // Loaded the actions/mutaions/getters/state...
    await LoadTiLinkedObj(modConf, { 
      dynamicAlias : new Ti.Config.AliasMapping({
        "^\./" : base + "/"
      })
    })
  
    // Loaded the sub-modules
    if(_.isArray(modConf.modules) && modConf.modules.length>0) {
      let ps = []
      for(let mod of modConf.modules) {
        ps.push(TiVue.LoadVuexModule(mod))
      }
      // wait the loading has been done
      await Promise.all(ps)
    }
    
    // Then return
    return modConf
  },
  //---------------------------------------
  LoadVueComponents(components=[]) {
    let ps = []
    for(let com of components) {
      ps.push(LoadTiLinkedObj(com, { 
        dynamicAlias : new Ti.Config.AliasMapping({
          "^\./" : com[BASE] + "/"
        })
      }))
    }
    return Promise.all(ps)
  },
  //---------------------------------------
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
      mutations : Ti.Util.merge({}, conf.mutaions),
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
  /***
  Generated a new conf object for `Vue` to generated a new Vue instance.

  @params
  - `conf{Object}` Configuration object of `app | app.components[n]`

  @return A New Configuration Object
  */
  VueSetup(conf={}) {
    //.............................
    // Pick necessary fields
    //.............................
    /*Data*/
    const Data = _.pick(conf, [
      "data",
      "props",   /*props:[..] would not be supported*/
      "computed",
      "methods",
      "watch"])
    // TODO if store exists, else drop the stub object ("...":Any)
    {
      // TODO expend computed
      // TODO expend methods
    }
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
    const global = {}
    const Assets = _.pick(conf, [
      "directives",
      "filters",
      "components"])
    _.forOwn(Assets, (val, key, obj)=>{
      const list = _.flattenDeep([val])
      const remain = []
      for(let asset of list) {
        // => global
        if(asset.globally) {
          Ti.Util.pushValue(global, key, val)
        }
        // => key
        else {
          remain.push(asset)
        }
      }
      obj[key] = remain
    })
    //.............................
    /*Composition*/
    const Composition = _.pick(conf, [
      "mixin",
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
      ..._.mapValues(
          LifecycleHooks, Ti.Util.groupCall),
      ..._.mapValues(
          Assets, v=>Ti.Util.merge({}, v)),
      ..._.mapValues(
          Composition, v=>Ti.Util.merge({}, v)),
      ... Misc
    }

    // thunk data
    if(!_.isFunction(options.data)) {
      options.data = Ti.Util.genObj(options.data)
    }

    // return the setup object
    return {
      global, options
    }
  },
  //---------------------------------------
  CreateInstance(setup, store) {
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
    _.map(setup.global.components, com=>{
      Vue.component(com.name, com)
    })

    // bind Vuex.store
    if(store)
      setup.options.store = store

    // return new vm instance
    return new Vue(setup.options)
  }
}